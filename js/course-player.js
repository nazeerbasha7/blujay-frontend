// ============================================
// COURSE PLAYER - Blujay Technologies
// Complete Backend Integration with Progress Tracking
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
const API_URL = 'http://localhost:5000/api';

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
// STATE VARIABLES
// ============================================
let currentCourse = null;
let currentEnrollment = null;
let currentVideoIndex = 0;
let allVideos = [];
let completedVideos = [];
let currentUser = null;
let courseId = null;
let enrollmentId = null;

// ============================================
// GET COURSE ID FROM URL
// ============================================
function getParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        courseId: urlParams.get('courseId'),
        enrollmentId: urlParams.get('enrollmentId')
    };
}

// ============================================
// CHECK AUTHENTICATION STATUS
// ============================================
async function checkAuthenticationStatus() {
    const token = localStorage.getItem('authToken');
    
    console.log('🔍 Checking authentication...');
    
    if (!token) {
        console.log('❌ No token found, redirecting to login...');
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const response = await authenticatedFetch('/auth/me');
        
        if (!response || !response.ok) {
            console.error('❌ Token verification failed');
            return false;
        }
        
        console.log('✅ Token verified');
        return true;
        
    } catch (error) {
        console.error('❌ Auth check error:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// ============================================
// INITIALIZE COURSE
// ============================================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('✅ Firebase user authenticated:', user.email || user.phoneNumber);
        currentUser = user;
        
        const isAuthenticated = await checkAuthenticationStatus();
        
        if (isAuthenticated) {
            const params = getParamsFromURL();
            courseId = params.courseId;
            enrollmentId = params.enrollmentId;
            
            if (courseId && enrollmentId) {
                await loadCourseAndEnrollment();
            } else {
                console.error('❌ Missing courseId or enrollmentId');
                alert('Invalid course access!');
                window.location.href = 'my-learning.html';
            }
        }
    } else {
        console.log('❌ No Firebase user, redirecting to login...');
        window.location.href = 'login.html';
    }
});

// ============================================
// ✅ NEW: LOAD COURSE & ENROLLMENT FROM BACKEND
// ============================================
async function loadCourseAndEnrollment() {
    try {
        console.log('🔄 Loading course and enrollment from backend...');
        
        // Load curriculum
        const curriculumResponse = await authenticatedFetch(`/courses/${courseId}/curriculum`);
        if (!curriculumResponse || !curriculumResponse.ok) {
            throw new Error('Failed to load curriculum');
        }
        
        const curriculumData = await curriculumResponse.json();
        
        // Load enrollment progress
        const enrollmentResponse = await authenticatedFetch(`/enrollments/${enrollmentId}`);
        if (!enrollmentResponse || !enrollmentResponse.ok) {
            throw new Error('Failed to load enrollment');
        }
        
        const enrollmentData = await enrollmentResponse.json();
        
        if (curriculumData.success && enrollmentData.success) {
            currentCourse = curriculumData.curriculum;
            currentEnrollment = enrollmentData.enrollment;
            
            console.log('✅ Course loaded:', currentCourse);
            console.log('✅ Enrollment loaded:', currentEnrollment);
            
            initializeCourse();
        }
        
    } catch (error) {
        console.error('❌ Error loading course:', error);
        alert('Failed to load course. Please try again.');
        window.location.href = 'my-learning.html';
    }
}

// ============================================
// INITIALIZE COURSE PLAYER
// ============================================
function initializeCourse() {
    // Set course title
    const courseTitleEl = document.getElementById('course-title');
    if (courseTitleEl) courseTitleEl.textContent = 'Course Player'; // Title from course data not in curriculum
    
    // Flatten all videos
    allVideos = [];
    currentCourse.modules.forEach(module => {
        module.videos.forEach(video => {
            allVideos.push({ 
                ...video, 
                moduleId: module.moduleId, 
                moduleTitle: module.title 
            });
        });
    });
    
    // Get completed videos from enrollment
    completedVideos = currentEnrollment.completedVideos || [];
    
    // Find first incomplete video
    currentVideoIndex = allVideos.findIndex(v => !completedVideos.includes(v.videoId));
    if (currentVideoIndex === -1) currentVideoIndex = 0;
    
    // If lastWatchedVideo exists, start from there
    if (currentEnrollment.lastWatchedVideo) {
        const lastIndex = allVideos.findIndex(v => v.videoId === currentEnrollment.lastWatchedVideo);
        if (lastIndex !== -1) currentVideoIndex = lastIndex;
    }
    
    // Render
    renderCurriculum();
    loadVideo(currentVideoIndex);
    updateProgress();
    
    console.log('✅ Course initialized');
    console.log('📚 Total videos:', allVideos.length);
    console.log('✓ Completed:', completedVideos.length);
}

// ============================================
// RENDER CURRICULUM SIDEBAR
// ============================================
function renderCurriculum() {
    const desktopContainer = document.getElementById('curriculum-container');
    const mobileContainer = document.getElementById('mobile-curriculum-container');
    
    const curriculumHTML = currentCourse.modules.map((module, moduleIndex) => {
        const moduleVideos = module.videos;
        const completedCount = moduleVideos.filter(v => completedVideos.includes(v.videoId)).length;
        
        return `
            <div class="mb-4">
                <div class="module-header p-4 bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors" onclick="toggleModule('${module.moduleId}')">
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-900 text-sm">Module ${moduleIndex + 1}: ${module.title}</h4>
                        <p class="text-xs text-gray-600 mt-1">${completedCount}/${moduleVideos.length} lessons • ${calculateModuleDuration(moduleVideos)}</p>
                    </div>
                    <i class="fas fa-chevron-down text-gray-600 module-icon-${module.moduleId} transition-transform"></i>
                </div>
                
                <div id="module-content-${module.moduleId}" class="module-content open">
                    ${moduleVideos.map((video, videoIndex) => {
                        const globalIndex = allVideos.findIndex(v => v.videoId === video.videoId);
                        const isActive = globalIndex === currentVideoIndex;
                        const isCompleted = completedVideos.includes(video.videoId);
                        
                        return `
                            <div class="video-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} p-3 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors" onclick="playVideo(${globalIndex})">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'}">
                                    ${isCompleted ? '<i class="fas fa-check text-green-600 text-sm"></i>' : 
                                      isActive ? '<i class="fas fa-play text-blue-600 text-sm"></i>' : 
                                      '<i class="fas fa-play text-gray-400 text-sm"></i>'}
                                </div>
                                
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold text-gray-900 truncate">${video.title}</p>
                                    <p class="text-xs text-gray-500">${video.duration}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    if (desktopContainer) desktopContainer.innerHTML = curriculumHTML;
    if (mobileContainer) mobileContainer.innerHTML = curriculumHTML;
}

// ============================================
// TOGGLE MODULE
// ============================================
function toggleModule(moduleId) {
    const content = document.querySelectorAll(`#module-content-${moduleId}`);
    const icons = document.querySelectorAll(`.module-icon-${moduleId}`);
    
    content.forEach(el => {
        el.classList.toggle('open');
    });
    
    icons.forEach(icon => {
        icon.style.transform = content[0].classList.contains('open') ? 'rotate(0deg)' : 'rotate(-90deg)';
    });
}

window.toggleModule = toggleModule;

// ============================================
// CALCULATE MODULE DURATION
// ============================================
function calculateModuleDuration(videos) {
    let totalMinutes = 0;
    videos.forEach(v => {
        const [min, sec] = v.duration.split(':').map(Number);
        totalMinutes += min + (sec / 60);
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// ============================================
// LOAD VIDEO
// ============================================
function loadVideo(index) {
    if (index < 0 || index >= allVideos.length) return;
    
    currentVideoIndex = index;
    const video = allVideos[index];
    
    const videoIframe = document.getElementById('video-iframe');
    if (videoIframe) videoIframe.src = video.url;
    
    const videoTitle = document.getElementById('current-video-title');
    if (videoTitle) videoTitle.textContent = video.title;
    
    const videoDesc = document.getElementById('current-video-description');
    if (videoDesc) videoDesc.textContent = `Module: ${video.moduleTitle}`;
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === allVideos.length - 1;
    
    renderCurriculum();
    
    console.log('▶️ Playing video:', video.title);
}

// ============================================
// PLAY VIDEO
// ============================================
function playVideo(index) {
    loadVideo(index);
    
    const mobileSidebar = document.getElementById('mobile-sidebar');
    if (mobileSidebar) mobileSidebar.classList.remove('active');
}

window.playVideo = playVideo;

// ============================================
// NAVIGATION BUTTONS
// ============================================
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentVideoIndex > 0) {
            loadVideo(currentVideoIndex - 1);
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentVideoIndex < allVideos.length - 1) {
            loadVideo(currentVideoIndex + 1);
        }
    });
}

// ============================================
// ✅ NEW: MARK VIDEO AS COMPLETE (BACKEND)
// ============================================
const markCompleteBtn = document.getElementById('mark-complete-btn');

if (markCompleteBtn) {
    markCompleteBtn.addEventListener('click', async () => {
        const video = allVideos[currentVideoIndex];
        
        if (!completedVideos.includes(video.videoId)) {
            try {
                console.log('💾 Marking video as complete:', video.title);
                
                const response = await authenticatedFetch('/progress/mark-complete', {
                    method: 'POST',
                    body: JSON.stringify({
                        enrollmentId: enrollmentId,
                        videoId: video.videoId
                    })
                });
                
                if (!response || !response.ok) {
                    throw new Error('Failed to mark video complete');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    completedVideos.push(video.videoId);
                    currentEnrollment = data.enrollment;
                    
                    renderCurriculum();
                    updateProgress();
                    
                    console.log('✅ Video marked as complete, progress:', data.enrollment.progress + '%');
                    
                    // Auto-play next
                    if (currentVideoIndex < allVideos.length - 1) {
                        setTimeout(() => {
                            loadVideo(currentVideoIndex + 1);
                        }, 1000);
                    } else {
                        alert('🎉 Congratulations! You completed all videos!');
                    }
                }
                
            } catch (error) {
                console.error('❌ Error marking video complete:', error);
                alert('Failed to save progress. Please try again.');
            }
        }
    });
}

// ============================================
// UPDATE PROGRESS
// ============================================
function updateProgress() {
    const completed = completedVideos.length;
    const total = allVideos.length;
    const percentage = Math.round((completed / total) * 100);
    
    const videoProgress = document.getElementById('video-progress');
    const sidebarProgress = document.getElementById('sidebar-progress');
    const mobileProgress = document.getElementById('mobile-progress');
    const completedCount = document.getElementById('completed-count');
    const totalCount = document.getElementById('total-count');
    const progressBar = document.getElementById('progress-bar');
    const mobileProgressBar = document.getElementById('mobile-progress-bar');
    
    if (videoProgress) videoProgress.textContent = `${completed}/${total}`;
    if (sidebarProgress) sidebarProgress.textContent = `${percentage}%`;
    if (mobileProgress) mobileProgress.textContent = `${percentage}%`;
    if (completedCount) completedCount.textContent = completed;
    if (totalCount) totalCount.textContent = total;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (mobileProgressBar) mobileProgressBar.style.width = `${percentage}%`;
}

// ============================================
// MOBILE SIDEBAR TOGGLE
// ============================================
const mobileCurriculumBtn = document.getElementById('mobile-curriculum-btn');
const mobileSidebar = document.getElementById('mobile-sidebar');

if (mobileCurriculumBtn && mobileSidebar) {
    mobileCurriculumBtn.addEventListener('click', () => {
        mobileSidebar.classList.toggle('active');
    });
    
    let touchStartY = 0;
    mobileSidebar.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    mobileSidebar.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        if (touchEndY - touchStartY > 100) {
            mobileSidebar.classList.remove('active');
        }
    });
}

// ============================================
// PROFILE DROPDOWN
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

console.log('✅ Course Player loaded - Backend API ready!');
console.log('📚 Fetching curriculum from MongoDB!');
console.log('💾 Progress tracking: LIVE!');
console.log('🔐 JWT authentication: READY!');
