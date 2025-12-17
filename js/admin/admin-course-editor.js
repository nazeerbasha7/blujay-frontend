// ============================================
// ADMIN COURSE EDITOR - Blujay Technologies
// Add/Edit Course Form with Backend Integration
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

let isEditMode = false;
let editCourseId = null;

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
            initializePage();
        }
    } else {
        window.location.href = '../login.html';
    }
});

// ============================================
// INITIALIZE PAGE
// ============================================
function initializePage() {
    setupMobileMenu();
    setupForm();
    checkEditMode();
    
    console.log('✅ Course Editor initialized');
}

// ============================================
// CHECK IF EDITING EXISTING COURSE
// ============================================
function checkEditMode() {
    editCourseId = localStorage.getItem('editCourseId');
    
    if (editCourseId) {
        isEditMode = true;
        const pageTitle = document.getElementById('page-title');
        const saveText = document.getElementById('save-text');
        
        if (pageTitle) pageTitle.textContent = 'Edit Course';
        if (saveText) saveText.textContent = 'Update Course';
        
        loadCourseData(editCourseId);
        console.log('📝 Edit mode: Loading course', editCourseId);
    } else {
        console.log('➕ Create mode: New course');
    }
}

// ============================================
// LOAD COURSE DATA FROM BACKEND
// ============================================
async function loadCourseData(courseId) {
    try {
        console.log('🔄 Loading course data from backend:', courseId);
        
        const response = await authenticatedFetch(`/admin/courses/${courseId}`);
        
        if (!response || !response.ok) {
            throw new Error('Failed to fetch course data');
        }
        
        const data = await response.json();
        
        if (data.success && data.course) {
            const course = data.course;
            
            const fields = {
                'course-title': course.title,
                'course-description': course.description,
                'course-category': course.category,
                'course-level': course.level,
                'instructor-name': course.instructor,
                'course-price': course.price,
                'course-discounted-price': course.isFree ? '' : course.discountedPrice,
                'course-duration': course.duration,
                'course-language': course.language,
                'course-thumbnail': course.thumbnail,
                'course-status': course.status
            };
            
            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else if (value !== undefined) {
                        element.value = value;
                    }
                }
            });
            
            // Set FREE toggle
            const freeToggle = document.getElementById('course-is-free');
            if (freeToggle) {
                freeToggle.checked = course.isFree !== false;
                // Trigger change event to show/hide paid section
                freeToggle.dispatchEvent(new Event('change'));
            }
            
            updateCharCount();
            console.log('✅ Course data loaded from backend');
        }
        
    } catch (error) {
        console.error('❌ Error loading course:', error);
        showToast('Error loading course data', 'error');
        setTimeout(() => {
            window.location.href = 'admin-courses.html';
        }, 2000);
    }
}

// ============================================
// SETUP FORM
// ============================================
function setupForm() {
    const form = document.getElementById('course-form');
    const descriptionField = document.getElementById('course-description');
    
    if (!form) return;
    
    if (descriptionField) {
        descriptionField.addEventListener('input', updateCharCount);
    }
    
    form.addEventListener('submit', handleFormSubmit);
}

function updateCharCount() {
    const descriptionField = document.getElementById('course-description');
    const charCount = document.getElementById('desc-count');
    
    if (descriptionField && charCount) {
        charCount.textContent = descriptionField.value.length;
    }
}

// ============================================
// SAVE TO BACKEND
// ============================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('save-btn');
    const saveText = document.getElementById('save-text');
    const originalText = saveText?.textContent || 'Save Course';
    
    if (saveBtn) saveBtn.disabled = true;
    if (saveText) saveText.textContent = isEditMode ? 'Updating...' : 'Saving...';
    
    // Get isFree checkbox value - defaults to true if not found
    const isFreeCheckbox = document.getElementById('course-is-free');
    const isFree = isFreeCheckbox ? isFreeCheckbox.checked : true;
    
    console.log('🔍 isFree checkbox element:', isFreeCheckbox);
    console.log('🔍 isFree value:', isFree);
    
    const courseData = {
        title: document.getElementById('course-title')?.value.trim(),
        description: document.getElementById('course-description')?.value.trim(),
        category: document.getElementById('course-category')?.value,
        level: document.getElementById('course-level')?.value,
        instructor: document.getElementById('instructor-name')?.value.trim(),
        price: parseInt(document.getElementById('course-price')?.value),
        discountedPrice: isFree ? 0 : (parseInt(document.getElementById('course-discounted-price')?.value) || parseInt(document.getElementById('course-price')?.value)),
        isFree: isFree,
        duration: document.getElementById('course-duration')?.value.trim() || 'Self-paced',
        language: document.getElementById('course-language')?.value,
        thumbnail: document.getElementById('course-thumbnail')?.value.trim() || 'https://via.placeholder.com/800x450?text=Course',
        status: document.getElementById('course-status')?.value || 'draft'
    };
    
    console.log('📦 Course data being sent:', JSON.stringify(courseData, null, 2));
    
    if (!courseData.title || !courseData.description) {
        alert('Title and description are required');
        if (saveBtn) saveBtn.disabled = false;
        if (saveText) saveText.textContent = originalText;
        return;
    }
    
    console.log(isEditMode ? '📝 Updating course...' : '➕ Creating course...', courseData);
    
    try {
        const endpoint = isEditMode ? `/admin/courses/${editCourseId}` : '/admin/courses';
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await authenticatedFetch(endpoint, {
            method: method,
            body: JSON.stringify(courseData)
        });
        
        if (!response || !response.ok) {
            const errorData = await response?.json().catch(() => ({}));
            throw new Error(errorData?.message || 'Failed to save course');
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Course saved to backend!', data.course);
            showToast(
                isEditMode ? 'Course updated successfully!' : 'Course created successfully!',
                'success'
            );
            
            localStorage.removeItem('editCourseId');
            
            setTimeout(() => {
                window.location.href = 'admin-courses.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Error saving course:', error);
        alert('Error saving course: ' + error.message);
        if (saveBtn) saveBtn.disabled = false;
        if (saveText) saveText.textContent = originalText;
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
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

console.log('✅ Course Editor loaded - Backend API ready!');
