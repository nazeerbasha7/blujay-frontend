// ============================================
// ADMIN NAVBAR - SHARED COMPONENT
// Works on all admin pages with full functionality
// ============================================

// ✅ DECLARE FIREBASE GLOBALLY (ONLY ONCE HERE)
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// HELPER FUNCTION FOR AUTHENTICATED API CALLS
// ============================================
async function authenticatedFetch(endpoint, options = {}) {
    const API_URL = window.API_CONFIG?.getApiUrl() || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000/api' 
            : 'https://blujay-backend.onrender.com/api');

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
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let userData = {};
let selectedPhoto = null;
let interests = [];

// ============================================
// CHECK ADMIN AUTHENTICATION WITH BACKEND
// ============================================
async function checkAdminAuthentication() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    console.log('🔍 Checking admin authentication...');
    console.log('   • Token exists:', !!token);
    console.log('   • User role:', userRole);
    
    if (!token) {
        console.log('❌ No authentication token, redirecting to login...');
        window.location.href = '../login.html';
        return false;
    }
    
    if (userRole !== 'admin') {
        console.log('❌ Not an admin user, redirecting to student dashboard...');
        alert('Access denied! Admin only.');
        window.location.href = '../dashboard.html';
        return false;
    }
    
    try {
        const response = await authenticatedFetch('/auth/me');
        
        if (!response || !response.ok) {
            console.error('❌ Token verification failed');
            return false;
        }
        
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            console.log('✅ Admin authentication verified');
            return true;
        } else {
            console.log('❌ User is not admin');
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
// CHECK AUTHENTICATION & LOAD USER DATA
// ============================================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        console.log('✅ Firebase user authenticated:', user.email);
        
        const isAdmin = await checkAdminAuthentication();
        
        if (isAdmin) {
            loadUserDataFromLocalStorage();
            await loadUserDataFromBackend();
        }
    } else {
        console.log('❌ No Firebase user, redirecting to login...');
        window.location.href = '../login.html';
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
            profilePhoto: userPhoto || 'https://ui-avatars.com/api/?name=Admin&background=1D5D7F&color=fff',
            bio: '',
            interests: [],
            socialLinks: { linkedin: '', github: '', portfolio: '' }
        };
        
        updateAdminUI(userData);
        console.log('✅ Admin data loaded from localStorage (fast)');
    }
}

// ============================================
// LOAD USER DATA FROM BACKEND (FRESH)
// ============================================
async function loadUserDataFromBackend() {
    try {
        console.log('🔄 Fetching fresh admin data from backend...');
        
        const response = await authenticatedFetch('/auth/me');
        
        if (!response || !response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        if (data.success) {
            userData = data.user;
            console.log('✅ Admin data loaded from backend:', userData);
            
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userEmail', userData.email);
            localStorage.setItem('userPhoto', userData.profilePhoto);
            
            updateAdminUI(userData);
            populateProfileSidebar(userData);
        }
        
    } catch (error) {
        console.error('❌ Error loading admin data from backend:', error);
        console.log('⚠️ Using localStorage data as fallback');
    }
}

// ============================================
// UPDATE ADMIN UI
// ============================================
function updateAdminUI(data) {
    const nameHeader = document.getElementById('user-name-header');
    const nameDropdown = document.getElementById('user-name-dropdown');
    const emailDropdown = document.getElementById('user-email-dropdown');
    const userPhoto = document.getElementById('user-photo');
    const sidebarPhoto = document.getElementById('sidebar-photo');
    
    if (nameHeader) nameHeader.textContent = data.name || 'Admin';
    if (nameDropdown) nameDropdown.textContent = data.name || 'Admin';
    if (emailDropdown) emailDropdown.textContent = data.email || '';
    
    const photoUrl = data.profilePhoto || 'https://ui-avatars.com/api/?name=Admin&background=1D5D7F&color=fff';
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
// PHOTO UPLOAD
// ============================================
const photoUploadInput = document.getElementById('photo-upload');
const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const removePhotoBtn = document.getElementById('remove-photo-btn');
const photoUploadWrapper = document.querySelector('.photo-upload-wrapper');
const sidebarPhoto = document.getElementById('sidebar-photo');

if (uploadPhotoBtn) uploadPhotoBtn.addEventListener('click', () => photoUploadInput?.click());
if (photoUploadWrapper) photoUploadWrapper.addEventListener('click', () => photoUploadInput?.click());

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
            if (sidebarPhoto) sidebarPhoto.src = 'https://ui-avatars.com/api/?name=Admin&background=1D5D7F&color=fff';
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
// INTERESTS MANAGEMENT
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
// SAVE PROFILE
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
            const response = await authenticatedFetch('/auth/update-profile', {
                method: 'PUT',
                body: JSON.stringify(updatedData)
            });
            
            if (!response || !response.ok) {
                throw new Error('Failed to save profile');
            }
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Profile saved to MongoDB!');
                userData = { ...userData, ...data.user };
                updateAdminUI(userData);
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
                console.log('✅ Admin logged out successfully');
                window.location.href = '../index.html';
            })
            .catch((error) => {
                console.error('❌ Logout error:', error);
                window.location.href = '../index.html';
            });
    }
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);

console.log('✅ Admin navbar loaded with backend integration!');
console.log('🔐 Admin authentication: READY');
console.log('🔥 Backend API: CONNECTED');
