// ============================================
// STUDENT DASHBOARD - Blujay Technologies
// Complete Backend Integration (MongoDB)
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// BACKEND API CONFIGURATION
// ============================================
const API_URL = 'https://blujay-backend.onrender.com/api';

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
let selectedPhoto = null;
let interests = [];

// ============================================
// CHECK AUTHENTICATION WITH BACKEND
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
            await loadUserDataFromBackend();
            showAdminDashboardLink();
            
            // Load courses from backend
            if (document.getElementById('courses-grid')) {
                await loadCoursesFromBackend();
            }
        }
    } else {
        console.log('❌ No Firebase user, redirecting to login...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
});

// ============================================
// LOAD USER DATA FROM LOCALSTORAGE (FAST)
// ============================================
function loadUserDataFromLocalStorage() {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhoto = localStorage.getItem('userPhoto');
    
    if (userName) {
        userData = {
            name: userName,
            email: userEmail || '',
            profilePhoto: userPhoto || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff',
            bio: '',
            interests: [],
            socialLinks: { linkedin: '', github: '', portfolio: '' }
        };
        
        updateDashboardUI(userData);
        console.log('✅ User data loaded from localStorage (fast)');
    }
}

// ============================================
// LOAD USER DATA FROM BACKEND (FRESH)
// ============================================
async function loadUserDataFromBackend() {
    try {
        console.log('🔄 Fetching fresh user data from backend...');
        
        const response = await authenticatedFetch('/auth/me');
        
        if (!response || !response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        if (data.success) {
            userData = data.user;
            console.log('✅ User data loaded from backend:', userData);
            
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userEmail', userData.email);
            localStorage.setItem('userPhoto', userData.profilePhoto);
            
            updateDashboardUI(userData);
            populateProfileSidebar(userData);
        }
        
    } catch (error) {
        console.error('❌ Error loading user data from backend:', error);
        console.log('⚠️ Using localStorage data as fallback');
    }
}

// ============================================
// UPDATE DASHBOARD UI
// ============================================
function updateDashboardUI(data) {
    const userNameHeader = document.getElementById('user-name-header');
    const userNameDropdown = document.getElementById('user-name-dropdown');
    const userEmailDropdown = document.getElementById('user-email-dropdown');
    const welcomeName = document.getElementById('welcome-name');
    const userPhoto = document.getElementById('user-photo');
    const sidebarPhoto = document.getElementById('sidebar-photo');
    
    if (userNameHeader) userNameHeader.textContent = data.name || 'Student';
    if (userNameDropdown) userNameDropdown.textContent = data.name || 'Student';
    if (userEmailDropdown) userEmailDropdown.textContent = data.email || data.phoneNumber || '';
    if (welcomeName) welcomeName.textContent = (data.name || 'Student').split(' ')[0];
    
    const photoUrl = data.profilePhoto || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff';
    if (userPhoto) userPhoto.src = photoUrl;
    if (sidebarPhoto) sidebarPhoto.src = photoUrl;
}

// ============================================
// POPULATE PROFILE SIDEBAR
// ============================================
function populateProfileSidebar(data) {
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    const editPhone = document.getElementById('edit-phone');
    const editBio = document.getElementById('edit-bio');
    const editLinkedin = document.getElementById('edit-linkedin');
    const editGithub = document.getElementById('edit-github');
    const editPortfolio = document.getElementById('edit-portfolio');
    
    if (editName) editName.value = data.name || '';
    if (editEmail) editEmail.value = data.email || '';
    if (editPhone) editPhone.value = data.phoneNumber || '';
    if (editBio) editBio.value = data.bio || '';
    if (editLinkedin) editLinkedin.value = data.socialLinks?.linkedin || '';
    if (editGithub) editGithub.value = data.socialLinks?.github || '';
    if (editPortfolio) editPortfolio.value = data.socialLinks?.portfolio || '';
    
    updateBioCount();
    renderInterests(data.interests || []);
}

// ============================================
// ✅ LOAD COURSES FROM BACKEND
// ============================================
async function loadCoursesFromBackend() {
    try {
        console.log('🔄 Loading courses from backend...');
        
        const response = await authenticatedFetch('/courses');
        
        if (!response || !response.ok) {
            throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        
        if (data.success) {
            const coursesContainer = document.getElementById('courses-grid');
            if (!coursesContainer) return;
            
            coursesContainer.innerHTML = '';
            
            // ✅ Filter only PUBLISHED courses
            const publishedCourses = data.courses.filter(course => course.status === 'published');
            
            if (publishedCourses.length === 0) {
                coursesContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center py-12">No courses available yet</p>';
                return;
            }
            
            publishedCourses.forEach(course => {
                const courseCard = createCourseCard(course);
                coursesContainer.innerHTML += courseCard;
            });
            
            console.log(`✅ Loaded ${publishedCourses.length} published courses from MongoDB`);
        }
        
    } catch (error) {
        console.error('❌ Error loading courses:', error);
        const coursesContainer = document.getElementById('courses-grid');
        if (coursesContainer) {
            coursesContainer.innerHTML = '<p class="text-red-500 col-span-full text-center py-12">Error loading courses. Please refresh.</p>';
        }
    }
}

// ============================================
// CREATE COURSE CARD HTML
// ============================================
function createCourseCard(course) {
    const originalPrice = course.price || 4999;
    const discountPrice = course.discountedPrice || originalPrice;
    const discount = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    
    return `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div class="relative">
                <img src="${course.thumbnail || 'https://via.placeholder.com/400x225'}" alt="${course.title}" class="w-full h-48 object-cover">
                <div class="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ₹${discountPrice.toLocaleString()}
                </div>
                ${discount > 0 ? `<div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">${discount}% OFF</div>` : ''}
            </div>
            <div class="p-5">
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">${course.title}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${course.description || 'Learn professional skills with expert instructors'}</p>
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <span class="text-yellow-500">⭐</span>
                        <span class="text-sm font-semibold text-gray-700">${course.rating || '4.8'}</span>
                        <span class="text-sm text-gray-500">(${course.students || 0})</span>
                    </div>
                    <span class="text-sm text-gray-500">
                        <i class="far fa-clock mr-1"></i>${course.duration || '8 months'}
                    </span>
                </div>
                <button onclick="viewCourseDetails('${course.courseId}')" 
                    class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// ============================================
// ✅ NEW: VIEW COURSE DETAILS (Redirect to detail page)
// ============================================
window.viewCourseDetails = function(courseId) {
    console.log('📖 Viewing course details:', courseId);
    window.location.href = `course-detail.html?courseId=${courseId}`;
};

// ============================================
// ✅ ENROLL IN COURSE (BACKEND API) - KEPT FOR MY-LEARNING PAGE
// ============================================
window.enrollInCourse = async function(courseId, courseTitle) {
    if (!currentUser) {
        alert('Please login to enroll in courses');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('📚 Enrolling in course:', courseId);
    
    try {
        const response = await authenticatedFetch('/enrollments', {
            method: 'POST',
            body: JSON.stringify({ courseId })
        });
        
        if (!response || !response.ok) {
            const errorData = await response?.json().catch(() => ({}));
            
            if (errorData.message && errorData.message.includes('already enrolled')) {
                alert('You are already enrolled in this course!');
                window.location.href = 'my-learning.html';
                return;
            }
            
            throw new Error(errorData.message || 'Failed to enroll');
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Enrollment successful:', data.enrollment);
            alert(`Successfully enrolled in ${courseTitle}!`);
            window.location.href = 'my-learning.html';
        }
        
    } catch (error) {
        console.error('❌ Enrollment error:', error);
        alert('Error enrolling in course: ' + error.message);
    }
};

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
// PROFILE SIDEBAR OPEN/CLOSE
// ============================================
const openProfileBtn = document.getElementById('open-profile-btn');
const closeSidebarBtn = document.getElementById('close-sidebar');
const profileSidebar = document.getElementById('profile-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    if (profileSidebar && sidebarOverlay) {
        profileSidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        if (profileDropdown) profileDropdown.classList.add('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    if (profileSidebar && sidebarOverlay) {
        profileSidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

if (openProfileBtn) openProfileBtn.addEventListener('click', openSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileSidebar && profileSidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// ============================================
// PHOTO UPLOAD (Preview Only)
// ============================================
const photoUploadInput = document.getElementById('photo-upload');
const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const removePhotoBtn = document.getElementById('remove-photo-btn');
const photoUploadWrapper = document.querySelector('.photo-upload-wrapper');
const sidebarPhoto = document.getElementById('sidebar-photo');

if (uploadPhotoBtn) uploadPhotoBtn.addEventListener('click', () => photoUploadInput.click());
if (photoUploadWrapper) photoUploadWrapper.addEventListener('click', () => photoUploadInput.click());

if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            selectedPhoto = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (sidebarPhoto) sidebarPhoto.src = e.target.result;
            };
            reader.readAsDataURL(file);
            console.log('✅ Photo selected:', file.name);
        }
    });
}

if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
        if (confirm('Remove your profile photo?')) {
            if (sidebarPhoto) sidebarPhoto.src = 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff';
            selectedPhoto = null;
            if (photoUploadInput) photoUploadInput.value = '';
        }
    });
}

// ============================================
// BIO CHARACTER COUNT
// ============================================
const editBio = document.getElementById('edit-bio');
const bioCount = document.getElementById('bio-count');

function updateBioCount() {
    if (editBio && bioCount) {
        const count = editBio.value.length;
        bioCount.textContent = count;
        if (count > 200) {
            bioCount.style.color = 'red';
            editBio.value = editBio.value.substring(0, 200);
        } else {
            bioCount.style.color = '';
        }
    }
}

if (editBio) editBio.addEventListener('input', updateBioCount);

// ============================================
// INTERESTS/SKILLS MANAGEMENT
// ============================================
const interestsContainer = document.getElementById('interests-container');
const newInterestInput = document.getElementById('new-interest');
const addInterestBtn = document.getElementById('add-interest-btn');

function renderInterests(interestsList) {
    if (!interestsContainer) return;
    
    interests = interestsList || [];
    interestsContainer.innerHTML = '';
    
    if (interests.length === 0) {
        interestsContainer.innerHTML = '<p class="text-sm text-gray-500">No skills added yet</p>';
        return;
    }
    
    interests.forEach((interest, index) => {
        const tag = document.createElement('div');
        tag.className = 'interest-tag';
        tag.innerHTML = `${interest}<button onclick="removeInterest(${index})" title="Remove"><i class="fas fa-times"></i></button>`;
        interestsContainer.appendChild(tag);
    });
}

function addInterest() {
    if (!newInterestInput) return;
    
    const interest = newInterestInput.value.trim();
    if (!interest) {
        alert('Please enter a skill');
        return;
    }
    if (interests.includes(interest)) {
        alert('This skill is already added');
        return;
    }
    if (interests.length >= 10) {
        alert('Maximum 10 skills allowed');
        return;
    }
    interests.push(interest);
    newInterestInput.value = '';
    renderInterests(interests);
}

function removeInterest(index) {
    interests.splice(index, 1);
    renderInterests(interests);
}

window.removeInterest = removeInterest;

if (addInterestBtn) addInterestBtn.addEventListener('click', addInterest);
if (newInterestInput) {
    newInterestInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addInterest();
        }
    });
}

// ============================================
// SAVE PROFILE TO MONGODB (BACKEND API)
// ============================================
const saveProfileBtn = document.getElementById('save-profile-btn');

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        saveProfileBtn.disabled = true;
        saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
        
        const name = document.getElementById('edit-name')?.value.trim();
        const phone = document.getElementById('edit-phone')?.value.trim();
        const bio = document.getElementById('edit-bio')?.value.trim();
        const linkedin = document.getElementById('edit-linkedin')?.value.trim();
        const github = document.getElementById('edit-github')?.value.trim();
        const portfolio = document.getElementById('edit-portfolio')?.value.trim();
        
        if (!name) {
            alert('Name is required');
            saveProfileBtn.disabled = false;
            saveProfileBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
            return;
        }
        
        const updatedData = {
            name: name,
            phoneNumber: phone,
            bio: bio,
            interests: interests,
            socialLinks: { linkedin, github, portfolio }
        };
        
        try {
            console.log('💾 Saving profile to MongoDB...');
            
            const response = await authenticatedFetch('/auth/update-profile', {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });
            
            if (!response || !response.ok) {
                const errorData = await response?.json().catch(() => ({}));
                throw new Error(errorData?.message || 'Failed to save profile');
            }
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Profile saved to MongoDB!');
                
                userData = { ...userData, ...data.user };
                updateDashboardUI(userData);
                localStorage.setItem('userName', data.user.name);
                
                saveProfileBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Saved!';
                saveProfileBtn.className = 'w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm sm:text-base';
                
                setTimeout(() => {
                    saveProfileBtn.className = 'w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md text-sm sm:text-base';
                    saveProfileBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
                    saveProfileBtn.disabled = false;
                    closeSidebar();
                }, 1500);
            }
            
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            alert('Error saving profile: ' + error.message);
            saveProfileBtn.disabled = false;
            saveProfileBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
        }
    });
}

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.getElementById('logout-btn');
const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');

function handleLogout() {
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
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);

console.log('✅ Dashboard loaded - 100% Backend Integrated!');
console.log('📚 Courses: MongoDB via Backend API');
console.log('📝 Enrollment: MongoDB via Backend API');
console.log('💾 Profile: MongoDB via Backend API');
console.log('🔥 PHASE 3 COMPLETE - Course Detail Page Ready!');
