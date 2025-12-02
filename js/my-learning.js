// ============================================
// MY LEARNING PAGE - Blujay Technologies
// Student Enrolled Courses with Backend Integration
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCiedANEie5u-2XQOjdsUFgdkE7s08gArY",
  authDomain: "blujay-tech.firebaseapp.com",
  projectId: "blujay-tech",
  storageBucket: "blujay-tech.firebasestorage.app",
  messagingSenderId: "586422050005",
  appId: "1:586422050005:web:737ba2502d1b283ea6165c",
  measurementId: "G-1JE665W8D0"
};

// Initialize Firebase (prevent re-initialization)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// BACKEND API CONFIGURATION
// ============================================
const API_URL = 'https://blujay-backend.onrender.com/api';
//const API_URL = 'http://localhost:5000/api';

// ============================================
// HELPER FUNCTION FOR AUTHENTICATED API CALLS
// ============================================
async function authenticatedFetch(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.error('❌ No auth token found');
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
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
            window.location.href = 'login.html';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('❌ API request failed:', error);
        throw error;
    }
}

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let userData = {};
let enrolledCourses = [];
let currentFilter = 'all';

// ============================================
// CHECK AUTHENTICATION STATUS
// ============================================
async function checkAuthenticationStatus() {
    const token = localStorage.getItem('authToken');
    
    console.log('🔍 Checking authentication status...');
    
    if (!token) {
        console.log('❌ No authentication token found, redirecting to login...');
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const response = await authenticatedFetch('/auth/me');
        
        if (!response || !response.ok) {
            console.error('❌ Token verification failed');
            return false;
        }
        
        const data = await response.json();
        console.log('✅ Token verified, user authenticated');
        return true;
        
    } catch (error) {
        console.error('❌ Auth check error:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// ============================================
// SHOW ADMIN DASHBOARD LINK
// ============================================
function showAdminDashboardLink() {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'admin') {
        const profileDropdown = document.getElementById('profile-dropdown');
        if (!profileDropdown) return;
        
        const myLearningLink = profileDropdown.querySelector('a[href="my-learning.html"]');
        if (!myLearningLink) return;
        
        if (document.getElementById('admin-dashboard-link')) return;
        
        const adminLink = document.createElement('a');
        adminLink.id = 'admin-dashboard-link';
        adminLink.href = 'admin/admin-dashboard.html';
        adminLink.className = 'flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-all border-t border-b border-gray-100';
        adminLink.innerHTML = `
            <div class="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-user-shield text-orange-600"></i>
            </div>
            <div>
                <span class="text-sm font-medium text-gray-700">Admin Dashboard</span>
                <p class="text-xs text-gray-500">Back to admin panel</p>
            </div>
        `;
        
        myLearningLink.parentNode.insertBefore(adminLink, myLearningLink.nextSibling);
        console.log('✅ Admin Dashboard link added');
    }
}

// ============================================
// CHECK AUTHENTICATION & LOAD USER DATA
// ============================================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        console.log('✅ Firebase user authenticated:', user.email || user.phoneNumber);
        
        const isAuthenticated = await checkAuthenticationStatus();
        
        if (isAuthenticated) {
            loadUserDataFromLocalStorage();
            await loadEnrolledCoursesFromBackend();
            showAdminDashboardLink();
        }
    } else {
        console.log('❌ No Firebase user, redirecting to login...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
});

// ============================================
// LOAD USER DATA FROM LOCALSTORAGE
// ============================================
function loadUserDataFromLocalStorage() {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhoto = localStorage.getItem('userPhoto');
    
    if (userName) {
        userData = {
            name: userName,
            email: userEmail || '',
            profilePhoto: userPhoto || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff'
        };
        
        updateUserUI(userData);
        console.log('✅ User data loaded from localStorage');
    }
}

// ============================================
// UPDATE USER UI
// ============================================
function updateUserUI(data) {
    const userPhoto = document.getElementById('user-photo');
    if (userPhoto) {
        userPhoto.src = data.profilePhoto || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff';
    }
    
    const userNameHeader = document.getElementById('user-name-header');
    if (userNameHeader) {
        userNameHeader.textContent = data.name || 'Student';
    }
    
    const userNameDropdown = document.getElementById('user-name-dropdown');
    if (userNameDropdown) {
        userNameDropdown.textContent = data.name || 'Student';
    }
    
    const userEmailDropdown = document.getElementById('user-email-dropdown');
    if (userEmailDropdown) {
        userEmailDropdown.textContent = data.email || '';
    }
}

// ============================================
// ✅ NEW: LOAD ENROLLED COURSES FROM BACKEND
// ============================================
async function loadEnrolledCoursesFromBackend() {
    try {
        console.log('🔄 Loading enrolled courses from backend...');
        
        const response = await authenticatedFetch('/enrollments/my-courses');
        
        if (!response || !response.ok) {
            throw new Error('Failed to fetch enrolled courses');
        }
        
        const data = await response.json();
        
        if (data.success) {
            enrolledCourses = data.enrollments.map(enrollment => ({
                id: enrollment.courseId,
                enrollmentId: enrollment.enrollmentId,
                title: enrollment.course?.title || 'Untitled Course',
                instructor: enrollment.course?.instructor || 'Unknown',
                thumbnail: enrollment.course?.thumbnail || 'https://via.placeholder.com/400x250?text=Course',
                totalVideos: enrollment.course?.totalVideos || 0,
                completedVideos: enrollment.completedVideos?.length || 0,
                progress: enrollment.progress || 0,
                lastWatchedVideo: enrollment.lastWatchedVideo,
                status: enrollment.status,
                enrolledDate: new Date(enrollment.enrolledAt).toLocaleDateString(),
                category: enrollment.course?.category || 'general',
                level: enrollment.course?.level || 'intermediate',
                certificateEligible: enrollment.progress >= 100
            }));
            
            console.log(`✅ Loaded ${enrolledCourses.length} enrolled courses from backend`);
            renderCourses();
        }
        
    } catch (error) {
        console.error('❌ Error loading enrolled courses:', error);
        enrolledCourses = [];
        renderCourses();
    }
}

// ============================================
// RENDER COURSES
// ============================================
function renderCourses() {
    const container = document.getElementById('courses-container');
    const emptyState = document.getElementById('empty-state');
    
    // Filter courses
    let filteredCourses = enrolledCourses;
    if (currentFilter === 'in-progress') {
        filteredCourses = enrolledCourses.filter(c => c.status === 'active' && c.progress < 100);
    } else if (currentFilter === 'completed') {
        filteredCourses = enrolledCourses.filter(c => c.status === 'completed' || c.progress >= 100);
    }
    
    // Show empty state if no courses
    if (filteredCourses.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
    }
    
    // Hide empty state
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Render courses
    container.innerHTML = filteredCourses.map(course => createCourseCard(course)).join('');
    
    console.log(`✅ Rendered ${filteredCourses.length} courses (filter: ${currentFilter})`);
}

// ============================================
// CREATE COURSE CARD HTML
// ============================================
function createCourseCard(course) {
    const progressColor = course.progress >= 100 ? 'bg-green-600' : 'bg-blue-600';
    const certificateBadge = course.certificateEligible ? `
        <div class="certificate-badge flex items-center gap-2 mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <i class="fas fa-certificate text-green-600"></i>
            <span class="text-xs font-semibold text-green-700">Certificate Ready</span>
        </div>
    ` : '';
    
    const difficultyColor = {
        'beginner': 'bg-green-100 text-green-700',
        'intermediate': 'bg-yellow-100 text-yellow-700',
        'advanced': 'bg-red-100 text-red-700'
    }[course.level.toLowerCase()];
    
    const levelText = course.level.charAt(0).toUpperCase() + course.level.slice(1);
    
    return `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
            <!-- Thumbnail -->
            <div class="relative">
                <img src="${course.thumbnail}" alt="${course.title}" class="w-full h-40 sm:h-48 object-cover">
                <div class="absolute top-3 left-3 px-3 py-1 ${difficultyColor} rounded-full text-xs font-bold">
                    ${levelText}
                </div>
                ${course.progress >= 100 ? `
                    <div class="absolute top-3 right-3 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-check text-white"></i>
                    </div>
                ` : ''}
            </div>
            
            <!-- Content -->
            <div class="p-5">
                <!-- Title & Instructor -->
                <h3 class="text-lg font-bold text-gray-900 mb-1 line-clamp-2">${course.title}</h3>
                <p class="text-sm text-gray-600 mb-4">By: ${course.instructor}</p>
                
                <!-- Progress Bar -->
                <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-900">${course.progress}% Complete</span>
                        <span class="text-xs text-gray-500">${course.completedVideos}/${course.totalVideos} videos</span>
                    </div>
                    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="progress-bar h-full ${progressColor}" style="width: ${course.progress}%"></div>
                    </div>
                </div>
                
                <!-- Stats -->
                <div class="flex items-center justify-between mb-4 text-xs text-gray-600">
                    <span><i class="far fa-calendar mr-1"></i>Enrolled: ${course.enrolledDate}</span>
                    <span><i class="fas fa-layer-group mr-1"></i>${course.category}</span>
                </div>
                
                <!-- Certificate Badge -->
                ${certificateBadge}
                
                <!-- Action Button -->
                <button onclick="openCourse('${course.id}', '${course.enrollmentId}')" class="w-full mt-4 ${course.progress >= 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                    <i class="fas ${course.progress >= 100 ? 'fa-trophy' : 'fa-play'}"></i>
                    <span>${course.progress >= 100 ? 'View Certificate' : 'Continue Learning'}</span>
                </button>
            </div>
        </div>
    `;
}

// ============================================
// OPEN COURSE (Navigate to course player)
// ============================================
function openCourse(courseId, enrollmentId) {
    console.log('🎬 Opening course:', courseId, 'Enrollment:', enrollmentId);
    window.location.href = `course-player.html?courseId=${courseId}&enrollmentId=${enrollmentId}`;
}

// Make function global
window.openCourse = openCourse;

// ============================================
// FILTER BUTTONS
// ============================================
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-700');
        });
        
        // Add active class to clicked button
        this.classList.remove('bg-gray-100', 'text-gray-700');
        this.classList.add('bg-blue-600', 'text-white');
        
        // Update filter and render
        currentFilter = this.getAttribute('data-filter');
        renderCourses();
    });
});

// ============================================
// PROFILE DROPDOWN TOGGLE
// ============================================
const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');

if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.add('hidden');
        }
    });
}

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            
            auth.signOut()
                .then(() => {
                    console.log('✅ Logged out successfully');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('❌ Logout error:', error);
                    window.location.href = 'index.html';
                });
        }
    });
}

console.log('✅ My Learning page loaded - Backend API ready!');
console.log('📚 Fetching enrolled courses from MongoDB!');
console.log('🔐 JWT authentication: READY');
