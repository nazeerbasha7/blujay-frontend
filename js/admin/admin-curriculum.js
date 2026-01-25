// ============================================
// ADMIN CURRICULUM BUILDER - Blujay Technologies
// Manage course modules and videos with Backend
// ============================================

// ✅ Firebase is declared in admin-navbar.js
// auth and db are available globally

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

let selectedCourse = null;
let curriculum = [];
let moduleCounter = 0;
let videoCounter = 0;

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
// INITIALIZE PAGE
// ============================================
async function initializePage() {
    setupMobileMenu();
    await setupCourseSelector();
    setupModals();
    
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    if (courseId) {
        const selector = document.getElementById('course-selector');
        if (selector) {
            selector.value = courseId;
            await loadCurriculum(courseId);
        }
    }
    
    console.log('✅ Curriculum Builder initialized');
}

// ============================================
// SETUP COURSE SELECTOR WITH BACKEND DATA
// ============================================
async function setupCourseSelector() {
    const selector = document.getElementById('course-selector');
    if (!selector) return;
    
    try {
        const response = await authenticatedFetch('/admin/courses');
        if (response && response.ok) {
            const data = await response.json();
            if (data.success && data.courses) {
                selector.innerHTML = '<option value="">Select a course</option>' +
                    data.courses.map(course => 
                        `<option value="${course.courseId}">${course.title}</option>`
                    ).join('');
                
                console.log('✅ Loaded', data.courses.length, 'courses');
            }
        }
    } catch (error) {
        console.error('❌ Error loading courses:', error);
    }
    
    selector.addEventListener('change', async (e) => {
        const courseId = e.target.value;
        if (courseId) {
            await loadCurriculum(courseId);
        } else {
            showEmptyState();
        }
    });
}

// ============================================
// LOAD CURRICULUM FROM BACKEND
// ============================================
async function loadCurriculum(courseId) {
    selectedCourse = courseId;
    
    try {
        console.log('🔄 Loading curriculum from backend:', courseId);
        
        const response = await authenticatedFetch(`/admin/courses/${courseId}/curriculum`);
        
        if (!response || !response.ok) {
            console.log('ℹ️ No curriculum found, starting empty');
            curriculum = [];
            moduleCounter = 0;
            videoCounter = 0;
        } else {
            const data = await response.json();
            if (data.success && data.curriculum) {
                curriculum = data.curriculum.modules.map(module => ({
                    id: module.moduleId,
                    title: module.title,
                    order: module.order,
                    videos: module.videos.map(video => ({
                        id: video.videoId,
                        title: video.title,
                        url: video.url,
                        duration: video.duration,
                        isFree: video.isFree
                    }))
                }));
                
                moduleCounter = curriculum.length;
                videoCounter = curriculum.reduce((count, m) => count + m.videos.length, 0);
                
                console.log('✅ Curriculum loaded from backend:', curriculum.length, 'modules');
            }
        }
        
    } catch (error) {
        console.error('❌ Error loading curriculum:', error);
        curriculum = [];
    }
    
    renderCurriculum();
    
    const emptyState = document.getElementById('empty-state');
    const modulesList = document.getElementById('modules-list');
    const saveContainer = document.getElementById('save-container');
    
    if (emptyState) emptyState.classList.add('hidden');
    if (modulesList) modulesList.classList.remove('hidden');
    if (saveContainer) saveContainer.classList.remove('hidden');
}

// ============================================
// RENDER CURRICULUM
// ============================================
function renderCurriculum() {
    const container = document.getElementById('modules-list');
    if (!container) return;
    
    if (curriculum.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No Modules Yet</h3>
                <p class="text-gray-600 mb-6">Start building your curriculum by adding modules</p>
                <button onclick="addModule()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add First Module
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = curriculum.map((module, moduleIndex) => `
        <div class="module-card" data-module-id="${module.id}">
            <div class="module-header">
                <div class="flex items-center flex-1 space-x-3">
                    <i class="fas fa-grip-vertical text-gray-400 cursor-move"></i>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800">${module.title}</h4>
                        <p class="text-sm text-gray-500">${module.videos.length} videos</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="editModule('${module.id}')" class="action-btn action-btn-edit" title="Edit module">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteModule('${module.id}')" class="action-btn action-btn-delete" title="Delete module">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="mt-4 space-y-2">
                ${module.videos.map((video, videoIndex) => `
                    <div class="video-item" data-video-id="${video.id}">
                        <i class="fas fa-grip-vertical text-gray-400 cursor-move"></i>
                        <i class="fas fa-play-circle text-blue-600"></i>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-800 truncate">${video.title}</p>
                            <p class="text-xs text-gray-500">${video.duration}${video.isFree ? ' • Free' : ''}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="editVideo('${module.id}', '${video.id}')" class="text-blue-600 hover:text-blue-700">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteVideo('${module.id}', '${video.id}')" class="text-red-600 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
                
                <button onclick="addVideo('${module.id}')" class="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add Video
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// MODULE OPERATIONS
// ============================================
function addModule() {
    if (!selectedCourse) {
        alert('Please select a course first');
        return;
    }
    
    const modal = document.getElementById('module-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeModuleModal() {
    const modal = document.getElementById('module-modal');
    const form = document.getElementById('module-form');
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
}

function setupModals() {
    const moduleForm = document.getElementById('module-form');
    if (moduleForm) {
        moduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('module-title');
            const title = titleInput?.value.trim();
            
            if (!title) {
                alert('Module title is required');
                return;
            }
            
            const newModule = {
                id: 'mod_' + Date.now(),
                title: title,
                order: curriculum.length + 1,
                videos: []
            };
            
            curriculum.push(newModule);
            moduleCounter++;
            renderCurriculum();
            closeModuleModal();
            showToast('Module added successfully', 'success');
            
            console.log('✅ Module added:', newModule.title);
        });
    }
    
    const videoForm = document.getElementById('video-form');
    if (videoForm) {
        videoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const moduleIdInput = document.getElementById('video-module-id');
            const titleInput = document.getElementById('video-title');
            const urlInput = document.getElementById('video-url');
            const durationInput = document.getElementById('video-duration');
            const freeCheckbox = document.getElementById('video-free');
            
            const moduleId = moduleIdInput?.value;
            const title = titleInput?.value.trim();
            const url = urlInput?.value.trim();
            const duration = durationInput?.value.trim();
            const isFree = freeCheckbox?.checked || false;
            
            if (!title || !url || !duration) {
                alert('All fields are required');
                return;
            }
            
            const module = curriculum.find(m => m.id === moduleId);
            if (module) {
                const newVideo = {
                    id: 'vid_' + Date.now(),
                    title: title,
                    url: url,
                    duration: duration,
                    isFree: isFree
                };
                
                module.videos.push(newVideo);
                videoCounter++;
                renderCurriculum();
                closeVideoModal();
                showToast('Video added successfully', 'success');
                
                console.log('✅ Video added:', newVideo.title);
            }
        });
    }
}

function editModule(moduleId) {
    const module = curriculum.find(m => m.id === moduleId);
    if (module) {
        const newTitle = prompt('Edit module title:', module.title);
        if (newTitle && newTitle.trim()) {
            module.title = newTitle.trim();
            renderCurriculum();
            showToast('Module updated', 'success');
        }
    }
}

function deleteModule(moduleId) {
    if (confirm('Are you sure you want to delete this module and all its videos?')) {
        curriculum = curriculum.filter(m => m.id !== moduleId);
        renderCurriculum();
        showToast('Module deleted', 'success');
        console.log('🗑️ Module deleted:', moduleId);
    }
}

// ============================================
// VIDEO OPERATIONS
// ============================================
function addVideo(moduleId) {
    const moduleIdInput = document.getElementById('video-module-id');
    const modal = document.getElementById('video-modal');
    if (moduleIdInput) moduleIdInput.value = moduleId;
    if (modal) modal.classList.remove('hidden');
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const form = document.getElementById('video-form');
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
}

function editVideo(moduleId, videoId) {
    const module = curriculum.find(m => m.id === moduleId);
    const video = module?.videos.find(v => v.id === videoId);
    
    if (video) {
        const newTitle = prompt('Edit video title:', video.title);
        if (newTitle && newTitle.trim()) {
            video.title = newTitle.trim();
            renderCurriculum();
            showToast('Video updated', 'success');
        }
    }
}

function deleteVideo(moduleId, videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        const module = curriculum.find(m => m.id === moduleId);
        if (module) {
            module.videos = module.videos.filter(v => v.id !== videoId);
            renderCurriculum();
            showToast('Video deleted', 'success');
            console.log('🗑️ Video deleted:', videoId);
        }
    }
}

// ============================================
// SAVE CURRICULUM TO BACKEND
// ============================================
async function saveCurriculum() {
    if (!selectedCourse) {
        alert('No course selected');
        return;
    }
    
    console.log('💾 Saving curriculum to backend:', selectedCourse);
    
    const curriculumData = {
        modules: curriculum.map(module => ({
            moduleId: module.id,
            title: module.title,
            order: module.order,
            videos: module.videos.map((video, index) => ({
                videoId: video.id,
                title: video.title,
                url: video.url,
                duration: video.duration,
                isFree: video.isFree,
                order: index + 1
            }))
        }))
    };
    
    try {
        const response = await authenticatedFetch(`/admin/courses/${selectedCourse}/curriculum`, {
            method: 'PUT',
            body: JSON.stringify(curriculumData)
        });
        
        if (!response || !response.ok) {
            throw new Error('Failed to save curriculum');
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Curriculum saved to backend!');
            showToast('Curriculum saved successfully!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error saving curriculum:', error);
        showToast('Error saving curriculum', 'error');
    }
}

// ============================================
// SHOW EMPTY STATE
// ============================================
function showEmptyState() {
    selectedCourse = null;
    curriculum = [];
    
    const emptyState = document.getElementById('empty-state');
    const modulesList = document.getElementById('modules-list');
    const saveContainer = document.getElementById('save-container');
    
    if (emptyState) emptyState.classList.remove('hidden');
    if (modulesList) modulesList.classList.add('hidden');
    if (saveContainer) saveContainer.classList.add('hidden');
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
// UTILITIES
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

window.addModule = addModule;
window.closeModuleModal = closeModuleModal;
window.editModule = editModule;
window.deleteModule = deleteModule;
window.addVideo = addVideo;
window.closeVideoModal = closeVideoModal;
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;
window.saveCurriculum = saveCurriculum;

console.log('✅ Curriculum Builder loaded - Backend API ready!');
