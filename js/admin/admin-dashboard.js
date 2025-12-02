// ============================================
// ADMIN DASHBOARD - Blujay Technologies
// Now with Backend Stats Integration
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
            console.error('❌ Authentication failed - token invalid');
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
// CHECK ADMIN AUTHENTICATION WITH BACKEND
// ============================================
async function checkAdminAuthentication() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    console.log('🔍 Checking admin authentication...');
    
    if (!token) {
        console.log('❌ No token, redirecting to login...');
        window.location.href = '../login.html';
        return false;
    }
    
    if (userRole !== 'admin') {
        console.log('❌ Not admin, redirecting to student dashboard...');
        alert('Access denied! Admin only.');
        window.location.href = '../dashboard.html';
        return false;
    }
    
    try {
        const response = await authenticatedFetch('/auth/me');
        
        if (!response || !response.ok) {
            return false;
        }
        
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            console.log('✅ Admin verified:', data.user.email);
            return true;
        } else {
            alert('Access denied! Admin only.');
            window.location.href = '../dashboard.html';
            return false;
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
        console.log('✅ Firebase user authenticated:', user.email);
        
        const isAdmin = await checkAdminAuthentication();
        
        if (isAdmin) {
            console.log('✅ Admin access granted');
            await initializeDashboard();
        }
    } else {
        console.log('❌ No Firebase user, redirecting to login...');
        window.location.href = '../login.html';
    }
});

// ============================================
// INITIALIZE DASHBOARD WITH BACKEND DATA
// ============================================
async function initializeDashboard() {
    console.log('🔄 Initializing admin dashboard...');
    
    setupMobileMenu();
    await fetchDashboardStats();
    
    console.log('✅ Admin Dashboard initialized successfully');
}

// ============================================
// FETCH REAL STATS FROM BACKEND
// ============================================
async function fetchDashboardStats() {
    try {
        console.log('🔄 Fetching dashboard stats from backend...');
        
        const coursesResponse = await authenticatedFetch('/admin/courses');
        
        if (!coursesResponse || !coursesResponse.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        
        const coursesData = await coursesResponse.json();
        
        if (coursesData.success) {
            const courses = coursesData.courses;
            
            const stats = {
                totalCourses: courses.length,
                publishedCourses: courses.filter(c => c.status === 'published').length,
                totalStudents: courses.reduce((sum, c) => sum + (c.students || 0), 0),
                totalRevenue: courses.reduce((sum, c) => 
                    sum + ((c.students || 0) * (c.discountedPrice || c.price || 0)), 0
                )
            };
            
            updateDashboardStats(stats);
            
            console.log('✅ Dashboard stats loaded:', stats);
        }
        
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        updateDashboardStats({
            totalCourses: 0,
            publishedCourses: 0,
            totalStudents: 0,
            totalRevenue: 0
        });
    }
}

// ============================================
// UPDATE DASHBOARD STATS
// ============================================
function updateDashboardStats(stats) {
    const totalCoursesEl = document.getElementById('total-courses');
    const totalStudentsEl = document.getElementById('total-students');
    const totalRevenueEl = document.getElementById('total-revenue');
    const totalEnrollmentsEl = document.getElementById('total-enrollments');
    
    if (totalCoursesEl) {
        totalCoursesEl.textContent = stats.totalCourses || 0;
    }
    if (totalStudentsEl) {
        totalStudentsEl.textContent = (stats.totalStudents || 0).toLocaleString();
    }
    if (totalRevenueEl) {
        const revenue = stats.totalRevenue || 0;
        if (revenue >= 100000) {
            totalRevenueEl.textContent = `₹${(revenue / 100000).toFixed(1)}L`;
        } else if (revenue >= 1000) {
            totalRevenueEl.textContent = `₹${(revenue / 1000).toFixed(1)}K`;
        } else {
            totalRevenueEl.textContent = `₹${revenue}`;
        }
    }
    if (totalEnrollmentsEl) {
        totalEnrollmentsEl.textContent = (stats.totalStudents || 0).toLocaleString();
    }
    
    console.log('✅ Dashboard stats updated');
}

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (!menuBtn || !sidebar || !overlay) {
        console.log('⚠️ Mobile menu elements not found');
        return;
    }
    
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.add('show');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    const closeSidebar = () => {
        sidebar.classList.remove('show');
        sidebar.classList.add('-translate-x-full');
        overlay.classList.remove('show');
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }
    
    overlay.addEventListener('click', closeSidebar);
    
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            closeSidebar();
        }
    });
    
    console.log('✅ Mobile menu setup complete');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function formatNumber(num) {
    if (num >= 100000) {
        return `${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

console.log('✅ Admin Dashboard JS loaded - Backend API ready!');
console.log('🔐 Admin authentication: READY');
console.log('📊 Dashboard stats: Live from MongoDB!');
