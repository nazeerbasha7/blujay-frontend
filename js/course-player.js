// ============================================
// COURSE PLAYER - Blujay Technologies (patched)
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

// Backend API
const API_URL = 'https://blujay-backend.onrender.com/api';

// ============================================
// AUTHENTICATED FETCH HELPER
// ============================================
async function authenticatedFetch(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    console.error('❌ No auth token found');
    alert('Session expired. Please login again.');
    window.location.href = 'login.html';
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    console.log('📡 Making request to:', `${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined
    });

    console.log('📨 Response status:', response.status, response.statusText);

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
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw new Error('Request timeout - backend server is slow or unavailable. Please try again.');
    }
    if ((error.message || '').includes('Failed to fetch')) {
      throw new Error('Network error - unable to connect to backend server. Please check your internet connection.');
    }
    throw error;
  }
}

// ============================================
// STATE
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
// PROFILE HELPERS (SAME DATA AS DASHBOARD)
// ============================================
function updateCoursePlayerProfileUI(data) {
  const userNameDropdown = document.getElementById('user-name-dropdown');
  const userEmailDropdown = document.getElementById('user-email-dropdown');
  const userPhoto = document.getElementById('user-photo');

  if (userNameDropdown) userNameDropdown.textContent = data.name || 'Student';
  if (userEmailDropdown) userEmailDropdown.textContent = data.email || data.phoneNumber || '';

  const photoUrl =
    data.profilePhoto ||
    'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff';

  if (userPhoto) {
    userPhoto.src = photoUrl;
  }
}

function loadUserDataFromLocalStorageForPlayer() {
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const userPhoto = localStorage.getItem('userPhoto');

  if (!userName) return;

  const data = {
    name: userName,
    email: userEmail || '',
    profilePhoto:
      userPhoto || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff'
  };

  updateCoursePlayerProfileUI(data);
}

// ============================================
// URL PARAMS
// ============================================
function getParamsFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    courseId: urlParams.get('courseId'),
    enrollmentId: urlParams.get('enrollmentId')
  };
}

// ============================================
// CLEAR STATIC PLACEHOLDERS
// ============================================
function clearStaticPlaceholders() {
  const courseTitleEl = document.getElementById('course-title');
  const currentVideoTitleEl = document.getElementById('current-video-title');
  const currentVideoDescEl = document.getElementById('current-video-description');
  const videoIframe = document.getElementById('video-iframe');
  const videoLoading = document.getElementById('video-loading');

  if (courseTitleEl) courseTitleEl.textContent = 'Loading course...';
  if (currentVideoTitleEl) currentVideoTitleEl.textContent = '';
  if (currentVideoDescEl) currentVideoDescEl.textContent = '';
  if (videoIframe) {
    videoIframe.src = '';
    videoIframe.classList.add('hidden');
  }
  if (videoLoading) videoLoading.classList.remove('hidden');
}
clearStaticPlaceholders();

// ============================================
// AUTH CHECK VIA TOKEN ENDPOINT
// ============================================
async function checkAuthenticationStatus() {
  const token = localStorage.getItem('authToken');
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
// AUTH LISTENER + LOAD PROFILE + COURSE
// ============================================
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log('❌ No Firebase user, redirecting to login...');
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  console.log('✅ Firebase user authenticated:', user.email || user.phoneNumber);

  const isAuthenticated = await checkAuthenticationStatus();
  if (!isAuthenticated) return;

  // 1) Fast profile from localStorage
  loadUserDataFromLocalStorageForPlayer();

  // 2) Fresh profile from backend (same as dashboard)
  try {
    const meRes = await authenticatedFetch('/auth/me');
    if (meRes && meRes.ok) {
      const meData = await meRes.json();
      if (meData.success) {
        const u = meData.user;
        localStorage.setItem('userName', u.name);
        localStorage.setItem('userEmail', u.email);
        localStorage.setItem('userPhoto', u.profilePhoto);
        updateCoursePlayerProfileUI(u);
      }
    }
  } catch (err) {
    console.error('❌ Failed to refresh user data on course player:', err);
  }

  const params = getParamsFromURL();
  courseId = params.courseId;
  enrollmentId = params.enrollmentId;

  if (!courseId || !enrollmentId) {
    console.error('❌ Missing courseId or enrollmentId');
    alert('Invalid course access!');
    window.location.href = 'my-learning.html';
    return;
  }

  await loadCourseAndEnrollment();
});

// ============================================
// LOAD CURRICULUM + ENROLLMENT
// ============================================
async function loadCourseAndEnrollment() {
  try {
    console.log('🔄 Loading course and enrollment from backend...');
    console.log('📍 Course ID:', courseId);
    console.log('📍 Enrollment ID:', enrollmentId);

    const curriculumResponse = await authenticatedFetch(
      `/courses/${encodeURIComponent(courseId)}/curriculum`
    );
    if (!curriculumResponse) throw new Error('No response from curriculum API');
    if (!curriculumResponse.ok) {
      const errorText = await curriculumResponse.text();
      throw new Error(`Failed to load curriculum: ${curriculumResponse.status} - ${errorText}`);
    }
    const curriculumData = await curriculumResponse.json();
    console.log('📚 Curriculum data received:', curriculumData);

    const enrollmentResponse = await authenticatedFetch(
      `/enrollments/${encodeURIComponent(enrollmentId)}`
    );
    if (!enrollmentResponse) throw new Error('No response from enrollment API');
    if (!enrollmentResponse.ok) {
      const errorText = await enrollmentResponse.text();
      throw new Error(`Failed to load enrollment: ${enrollmentResponse.status} - ${errorText}`);
    }
    const enrollmentData = await enrollmentResponse.json();
    console.log('🎓 Enrollment data received:', enrollmentData);

    if (curriculumData.success && enrollmentData.success) {
      currentCourse = curriculumData.curriculum;
      currentEnrollment = enrollmentData.enrollment;

      // Defensive: if backend returned modules array directly
      if (Array.isArray(currentCourse)) {
        console.warn('⚠️ currentCourse is an array, wrapping it in an object...');
        currentCourse = { modules: currentCourse };
      }

      console.log('✅ Course loaded:', currentCourse?.title || '(no title)');
      console.log('✅ Enrollment loaded:', currentEnrollment?.id || '(no id)');

      if (!currentCourse || !Array.isArray(currentCourse.modules)) {
        console.error('Invalid curriculum structure', currentCourse);
        alert('Course data is invalid. Redirecting to My Learning.');
        window.location.href = 'my-learning.html';
        return;
      }

      initializeCourse();
    } else {
      throw new Error(
        `API returned success=false. Curriculum: ${curriculumData.success}, Enrollment: ${enrollmentData.success}`
      );
    }
  } catch (error) {
    console.error('❌ Error loading course:', error);
    alert('Failed to load course. Error: ' + (error.message || error));
    window.location.href = 'my-learning.html';
  }
}

// ============================================
// INITIALIZE COURSE PLAYER
// ============================================
function initializeCourse() {
  const courseTitleEl = document.getElementById('course-title');
  if (courseTitleEl) courseTitleEl.textContent = currentCourse.title || 'Course Player';

  // Flatten videos
  allVideos = [];
  currentCourse.modules.forEach(module => {
    const vids = module.videos || [];
    vids.forEach(video => {
      allVideos.push({
        ...video,
        moduleId: module.moduleId || module.id || '',
        moduleTitle: module.title || ''
      });
    });
  });

  completedVideos = currentEnrollment.completedVideos || [];

  currentVideoIndex = allVideos.findIndex(v => !completedVideos.includes(v.videoId));
  if (currentVideoIndex === -1) currentVideoIndex = 0;

  if (currentEnrollment.lastWatchedVideo) {
    const lastIndex = allVideos.findIndex(v => v.videoId === currentEnrollment.lastWatchedVideo);
    if (lastIndex !== -1) currentVideoIndex = lastIndex;
  }

  renderCurriculum();
  loadVideo(currentVideoIndex);
  updateProgress();

  console.log(
    '✅ Course initialized. Total videos:',
    allVideos.length,
    'Completed:',
    completedVideos.length
  );
}

// ============================================
// RENDER CURRICULUM UI
// ============================================
function renderCurriculum() {
  const desktopContainer = document.getElementById('curriculum-container');
  const mobileContainer = document.getElementById('mobile-curriculum-container');

  const curriculumHTML = currentCourse.modules
    .map((module, moduleIndex) => {
      const moduleVideos = module.videos || [];
      const completedCount = moduleVideos.filter(v => completedVideos.includes(v.videoId)).length;

      return `
        <div class="mb-4">
          <div class="module-header p-4 bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors" onclick="toggleModule('${
            module.moduleId || module.id || moduleIndex
          }')">
            <div class="flex-1">
              <h4 class="font-bold text-gray-900 text-sm">Module ${moduleIndex + 1}: ${escapeHtml(
        module.title || 'Module'
      )}</h4>
              <p class="text-xs text-gray-600 mt-1">${completedCount}/${
        moduleVideos.length
      } lessons • ${calculateModuleDuration(moduleVideos)}</p>
            </div>
            <i class="fas fa-chevron-down text-gray-600 module-icon-${
              module.moduleId || module.id || moduleIndex
            } transition-transform"></i>
          </div>

          <div id="module-content-${module.moduleId || module.id || moduleIndex}" class="module-content open">
            ${moduleVideos
              .map((video) => {
                const globalIndex = allVideos.findIndex(v => v.videoId === video.videoId);
                const isActive = globalIndex === currentVideoIndex;
                const isCompleted = completedVideos.includes(video.videoId);
                return `
                  <div class="video-item ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                } p-3 border-b border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors" onclick="playVideo(${globalIndex})">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-100'
                        : isActive
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }">
                      ${
                        isCompleted
                          ? '<i class="fas fa-check text-green-600 text-sm"></i>'
                          : isActive
                          ? '<i class="fas fa-play text-blue-600 text-sm"></i>'
                          : '<i class="fas fa-play text-gray-400 text-sm"></i>'
                      }
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-900 truncate">${escapeHtml(
                        video.title || 'Untitled'
                      )}</p>
                      <p class="text-xs text-gray-500">${escapeHtml(video.duration || '')}</p>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    })
    .join('');

  if (desktopContainer) desktopContainer.innerHTML = curriculumHTML;
  if (mobileContainer) mobileContainer.innerHTML = curriculumHTML;
}

// ============================================
// TOGGLE MODULE
// ============================================
function toggleModule(moduleId) {
  const content = document.querySelectorAll(`#module-content-${moduleId}`);
  const icons = document.querySelectorAll(`.module-icon-${moduleId}`);
  if (!content || content.length === 0) return;
  content.forEach(el => el.classList.toggle('open'));
  icons.forEach(icon => {
    if (content[0].classList.contains('open')) icon.style.transform = 'rotate(0deg)';
    else icon.style.transform = 'rotate(-90deg)';
  });
}
window.toggleModule = toggleModule;

// ============================================
// UTILITIES
// ============================================
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function calculateModuleDuration(videos) {
  let totalMinutes = 0;
  videos.forEach(v => {
    if (!v.duration) return;
    const parts = String(v.duration).split(':').map(Number);
    const min = parts.length === 2 ? parts[0] : 0;
    const sec = parts.length === 2 ? parts[1] : 0;
    totalMinutes += min + (sec / 60);
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// ============================================
// VIDEO LOAD / NAVIGATION
// ============================================
function loadVideo(index) {
  if (index < 0 || index >= allVideos.length) return;

  currentVideoIndex = index;
  const video = allVideos[index];
  const videoLoading = document.getElementById('video-loading');
  const videoIframe = document.getElementById('video-iframe');

  if (videoLoading) videoLoading.classList.add('hidden');

  if (videoIframe) {
    const embed = video.embedUrl || video.playerUrl || video.url || '';
    if (embed) {
      videoIframe.src = embed;
      videoIframe.classList.remove('hidden');
    } else {
      videoIframe.classList.add('hidden');
    }
  }

  const videoTitle = document.getElementById('current-video-title');
  if (videoTitle) videoTitle.textContent = video.title || '';

  const videoDesc = document.getElementById('current-video-description');
  if (videoDesc) videoDesc.textContent = video.description || `Module: ${video.moduleTitle || ''}`;

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === allVideos.length - 1;

  renderCurriculum();
  updateProgress();

  console.log(
    '▶️ Playing video:',
    video.title || '(no title)',
    'embed:',
    video.embedUrl || video.playerUrl || video.url || '(none)'
  );
}

function playVideo(index) {
  if (typeof index !== 'number' || index < 0) return;
  loadVideo(index);
  const mobileSidebar = document.getElementById('mobile-sidebar');
  if (mobileSidebar) mobileSidebar.classList.remove('active');
}
window.playVideo = playVideo;

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentVideoIndex > 0) loadVideo(currentVideoIndex - 1);
  });
}
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentVideoIndex < allVideos.length - 1) loadVideo(currentVideoIndex + 1);
  });
}

// ============================================
// MARK COMPLETE (BACKEND)
// ============================================
const markCompleteBtn = document.getElementById('mark-complete-btn');
if (markCompleteBtn) {
  markCompleteBtn.addEventListener('click', async () => {
    if (!allVideos[currentVideoIndex]) return;
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

        if (!response || !response.ok) throw new Error('Failed to mark video complete');
        const data = await response.json();

        if (data.success) {
          completedVideos.push(video.videoId);
          currentEnrollment = data.enrollment || currentEnrollment;
          renderCurriculum();
          updateProgress();

          console.log('✅ Video marked as complete, enrollment updated');
          if (currentVideoIndex < allVideos.length - 1) {
            setTimeout(() => loadVideo(currentVideoIndex + 1), 700);
          } else {
            alert('🎉 Congratulations! You completed all videos!');
          }
        } else {
          throw new Error('API returned success=false while marking complete');
        }
      } catch (error) {
        console.error('❌ Error marking video complete:', error);
        alert('Failed to save progress. Please try again.');
      }
    }
  });
}

// ============================================
// PROGRESS UI
// ============================================
function updateProgress() {
  const completed = completedVideos.length;
  const total = allVideos.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

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
  mobileCurriculumBtn.addEventListener('click', () => mobileSidebar.classList.toggle('active'));
  let touchStartY = 0;
  mobileSidebar.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; });
  mobileSidebar.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY > 100) mobileSidebar.classList.remove('active');
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
    if (!confirm('Are you sure you want to logout?')) return;
    localStorage.clear();
    auth
      .signOut()
      .then(() => (window.location.href = 'index.html'))
      .catch(() => (window.location.href = 'index.html'));
  });
}

// ============================================
// HISTORY CHANGES (OTHER COURSE)
// ============================================
window.addEventListener('popstate', async () => {
  const params = getParamsFromURL();
  if (params.courseId !== courseId || params.enrollmentId !== enrollmentId) {
    courseId = params.courseId;
    enrollmentId = params.enrollmentId;
    await loadCourseAndEnrollment();
  }
});

// ============================================
// INITIAL LOGS
// ============================================
console.log('✅ Course Player loaded - Backend API ready!');
