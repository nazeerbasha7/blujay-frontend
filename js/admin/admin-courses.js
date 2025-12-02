// ============================================
// ADMIN COURSES - Blujay Technologies
// Course Management with Backend Integration
// ============================================

// ✅ Firebase is declared in admin-navbar.js
// auth and db are available globally

// ============================================
// HELPER FUNCTION FOR AUTHENTICATED API CALLS
// ============================================
async function authenticatedFetch(endpoint, options = {}) {
    const API_URL = 'https://blujay-backend.onrender.com/api'; // ✅ MOVED INSIDE FUNCTION
    //const API_URL = 'http://localhost:5000/api';

    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.error('❌ No auth token found');
        alert('Session expired. Please login again.');
        window.location.href = '../login.html';
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            console.error('❌ Authentication failed');
            localStorage.clear();
            alert('Session expired. Please login again.');
            window.location.href = '../login.html';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('❌ API request failed:', error);
        throw error;
    }
}

// ============================================
// CHECK ADMIN AUTHENTICATION
// ============================================
async function checkAdminAuthentication() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'admin') {
        console.log('❌ Not admin, redirecting...');
        alert('Access denied! Admin only.');
        window.location.href = '../dashboard.html';
        return false;
    }
    
    try {
        const response = await authenticatedFetch('/auth/me');
        if (!response || !response.ok) return false;
        
        const data = await response.json();
        if (data.success && data.user.role === 'admin') {
            console.log('✅ Admin verified');
            return true;
        }
    } catch (error) {
        console.error('❌ Auth check error:', error);
        window.location.href = '../login.html';
        return false;
    }
}

// ============================================
// CHECK ADMIN ACCESS
// ============================================
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        const isAdmin = await checkAdminAuthentication();
        if (isAdmin) {
            console.log('✅ Admin access granted');
            await initializePage();
        }
    } else {
        window.location.href = '../login.html';
    }
});

// ============================================
// DATA VARIABLES
// ============================================
let coursesData = [];
let filteredCourses = [];
let currentPage = 1;
const coursesPerPage = 10;
let courseToDelete = null;

// ============================================
// INITIALIZE PAGE
// ============================================
async function initializePage() {
    setupMobileMenu();
    setupFilters();
    setupSearch();
    setupSelectAll();
    setupDeleteModal();
    
    await loadCoursesFromBackend();
    
    console.log('✅ Courses page initialized');
}

// ============================================
// LOAD COURSES FROM BACKEND
// ============================================
async function loadCoursesFromBackend() {
    try {
        console.log('🔄 Loading courses from backend...');
        
        const response = await authenticatedFetch('/admin/courses');
        
        if (!response || !response.ok) {
            throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        
        if (data.success) {
            coursesData = data.courses.map(course => ({
                id: course.courseId,
                title: course.title,
                instructor: course.instructor,
                students: course.students,
                price: course.price,
                discountedPrice: course.discountedPrice,
                category: course.category,
                status: course.status,
                thumbnail: course.thumbnail,
                createdAt: new Date(course.createdAt).toLocaleDateString()
            }));
            
            filteredCourses = [...coursesData];
            renderCourses();
            
            console.log(`✅ Loaded ${coursesData.length} courses from backend`);
        }
        
    } catch (error) {
        console.error('❌ Error loading courses:', error);
        showToast('Error loading courses from server', 'error');
        
        coursesData = [];
        filteredCourses = [];
        renderCourses();
    }
}

// ============================================
// RENDER COURSES TABLE
// ============================================
function renderCourses() {
    const tbody = document.getElementById('courses-table-body');
    if (!tbody) return;
    
    if (filteredCourses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12">
                    <div class="empty-state">
                        <i class="fas fa-folder-open empty-state-icon"></i>
                        <p class="empty-state-title">No courses found</p>
                        <p class="empty-state-text">Try adjusting your filters or add a new course</p>
                        <a href="admin-course-editor.html" class="btn-primary mt-4">
                            <i class="fas fa-plus mr-2"></i>Add Course
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = Math.min(startIndex + coursesPerPage, filteredCourses.length);
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);
    
    tbody.innerHTML = coursesToShow.map(course => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td>
                <input type="checkbox" class="course-checkbox rounded" data-id="${course.id}">
            </td>
            <td>
                <div class="flex items-center space-x-3">
                    <img src="${course.thumbnail}" alt="${course.title}" class="w-16 h-10 rounded object-cover flex-shrink-0">
                    <div class="min-w-0">
                        <p class="font-semibold text-gray-800 truncate">${course.title}</p>
                        <p class="text-xs text-gray-500">${course.category}</p>
                    </div>
                </div>
            </td>
            <td class="hidden md:table-cell">
                <span class="text-sm text-gray-700">${course.instructor}</span>
            </td>
            <td class="hidden sm:table-cell">
                <span class="text-sm font-medium text-gray-800">${course.students}</span>
            </td>
            <td class="hidden lg:table-cell">
                <div>
                    <span class="text-sm font-bold text-gray-800">₹${course.discountedPrice.toLocaleString()}</span>
                    ${course.price !== course.discountedPrice ? 
                        `<br><span class="text-xs text-gray-500 line-through">₹${course.price.toLocaleString()}</span>` 
                        : ''}
                </div>
            </td>
            <td>
                <span class="badge badge-${course.status}">${capitalize(course.status)}</span>
            </td>
            <td>
                <div class="flex items-center gap-2">
                    <button onclick="editCourse('${course.id}')" class="action-btn action-btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="viewCourse('${course.id}')" class="action-btn action-btn-view" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="openDeleteModal('${course.id}')" class="action-btn action-btn-delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalCourses = document.getElementById('total-courses');
    
    if (showingStart) showingStart.textContent = startIndex + 1;
    if (showingEnd) showingEnd.textContent = endIndex;
    if (totalCourses) totalCourses.textContent = filteredCourses.length;
}

// ============================================
// SETUP FILTERS
// ============================================
function setupFilters() {
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    
    const statusValue = statusFilter?.value || 'all';
    const categoryValue = categoryFilter?.value || 'all';
    const searchTerm = searchInput?.value.toLowerCase() || '';
    
    filteredCourses = coursesData.filter(course => {
        const matchesStatus = statusValue === 'all' || course.status === statusValue;
        const matchesCategory = categoryValue === 'all' || course.category === categoryValue;
        const matchesSearch = course.title.toLowerCase().includes(searchTerm) || 
                             course.instructor.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesCategory && matchesSearch;
    });
    
    currentPage = 1;
    renderCourses();
    
    console.log('🔍 Filters applied:', filteredCourses.length, 'courses found');
}

// ============================================
// SETUP SEARCH
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });
}

// ============================================
// SETUP SELECT ALL
// ============================================
function setupSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    if (!selectAllCheckbox) return;
    
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.course-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });
}

// ============================================
// COURSE ACTIONS
// ============================================
function editCourse(courseId) {
    console.log('📝 Edit course:', courseId);
    localStorage.setItem('editCourseId', courseId);
    window.location.href = 'admin-course-editor.html';
}

function viewCourse(courseId) {
    console.log('👁️ View course:', courseId);
    window.location.href = `admin-curriculum.html?courseId=${courseId}`;
}

function openDeleteModal(courseId) {
    courseToDelete = courseId;
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.remove('hidden');
}

// ============================================
// DELETE MODAL
// ============================================
function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');
    
    if (!modal || !cancelBtn || !confirmBtn) return;
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        courseToDelete = null;
    });
    
    confirmBtn.addEventListener('click', () => {
        if (courseToDelete) {
            deleteCourse(courseToDelete);
            modal.classList.add('hidden');
            courseToDelete = null;
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            courseToDelete = null;
        }
    });
}

// ============================================
// DELETE FROM BACKEND
// ============================================
async function deleteCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    
    try {
        console.log('🗑️ Deleting course from backend:', courseId);
        
        const response = await authenticatedFetch(`/admin/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        if (!response || !response.ok) {
            throw new Error('Failed to delete course');
        }
        
        const data = await response.json();
        
        if (data.success) {
            coursesData = coursesData.filter(c => c.id !== courseId);
            filteredCourses = filteredCourses.filter(c => c.id !== courseId);
            renderCourses();
            
            showToast(`Course "${course.title}" deleted successfully`, 'success');
            console.log('✅ Course deleted from backend');
        }
        
    } catch (error) {
        console.error('❌ Error deleting course:', error);
        showToast('Error deleting course', 'error');
    }
}

// ============================================
// MOBILE MENU
// ============================================
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (!menuBtn || !sidebar || !overlay) return;
    
    menuBtn.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    });
    
    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    };
    
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.editCourse = editCourse;
window.viewCourse = viewCourse;
window.openDeleteModal = openDeleteModal;

console.log('✅ Admin Courses loaded - Backend API ready!');
