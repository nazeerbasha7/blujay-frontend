// ============================================
// COURSE DETAIL PAGE - Blujay Technologies
// Display complete course information
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
const API_URL = 'http://localhost:5000/api';

let currentCourse = null;
let currentCurriculum = null;

// ============================================
// GET COURSE ID FROM URL
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');

if (!courseId) {
    alert('No course selected');
    window.location.href = 'dashboard.html';
}

// ============================================
// LOAD COURSE DETAILS
// ============================================
async function loadCourseDetails() {
    try {
        console.log('🔄 Loading course details:', courseId);
        
        const response = await fetch(`${API_URL}/courses/${courseId}/full`);
        
        if (!response.ok) {
            throw new Error('Course not found');
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentCourse = data.course;
            currentCurriculum = data.curriculum;
            
            displayCourseDetails(data.course, data.curriculum, data.stats);
            
            console.log('✅ Course loaded:', currentCourse.title);
        }
        
    } catch (error) {
        console.error('❌ Error loading course:', error);
        alert('Error loading course details');
        window.location.href = 'dashboard.html';
    }
}

// ============================================
// DISPLAY COURSE DETAILS
// ============================================
function displayCourseDetails(course, curriculum, stats) {
    // Hide loading, show content
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    
    // Update page title
    document.title = `${course.title} - Blujay Technologies`;
    
    // Hero Section
    document.getElementById('course-title').textContent = course.title;
    document.getElementById('course-description').textContent = course.description;
    document.getElementById('course-rating').textContent = '4.8'; // Default
    document.getElementById('course-students').textContent = '(1,234 students)'; // Default
    document.getElementById('course-duration').textContent = course.duration || 'Self-paced';
    document.getElementById('course-level').textContent = course.level || 'Beginner';
    document.getElementById('course-instructor').textContent = course.instructor;
    
    // Buy Box
    document.getElementById('course-thumbnail').src = course.thumbnail || 'https://via.placeholder.com/400x225';
    document.getElementById('discount-price').textContent = `₹${course.discountedPrice.toLocaleString()}`;
    document.getElementById('original-price').textContent = `₹${course.price.toLocaleString()}`;
    
    // Calculate discount percentage
    const discount = Math.round(((course.price - course.discountedPrice) / course.price) * 100);
    if (discount > 0) {
        document.getElementById('discount-badge').textContent = `${discount}% OFF`;
    } else {
        document.getElementById('discount-badge').classList.add('hidden');
    }
    
    // Stats
    document.getElementById('total-modules').textContent = stats.totalModules;
    document.getElementById('total-videos').textContent = stats.totalVideos;
    
    // Full Description
    document.getElementById('course-description-full').textContent = course.description;
    
    // Curriculum
    renderCurriculum(curriculum, stats.freeVideos);
}

// ============================================
// RENDER CURRICULUM
// ============================================
function renderCurriculum(curriculum, freeVideosCount) {
    const container = document.getElementById('curriculum-container');
    
    if (!curriculum || curriculum.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No curriculum available yet</p>';
        return;
    }
    
    container.innerHTML = curriculum.map((module, index) => `
        <div class="border border-gray-200 rounded-lg">
            <div class="module-header p-4 flex items-center justify-between" onclick="toggleModule('module-${index}')">
                <div class="flex items-center gap-3">
                    <i class="fas fa-chevron-down text-gray-400 transition-transform" id="icon-module-${index}"></i>
                    <div>
                        <h3 class="font-semibold text-gray-900">${module.title}</h3>
                        <p class="text-sm text-gray-500">${module.videos?.length || 0} lectures</p>
                    </div>
                </div>
            </div>
            <div id="module-${index}" class="hidden border-t border-gray-200">
                ${(module.videos || []).map(video => `
                    <div class="video-item ${video.isFree ? 'free' : ''} flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-play-circle ${video.isFree ? 'text-green-600' : 'text-gray-400'}"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-800">${video.title}</p>
                                <p class="text-xs text-gray-500">${video.duration}</p>
                            </div>
                        </div>
                        ${video.isFree ? '<span class="text-xs font-semibold text-green-600">FREE PREVIEW</span>' : '<i class="fas fa-lock text-gray-400"></i>'}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    if (freeVideosCount > 0) {
        console.log(`✅ ${freeVideosCount} free preview videos available`);
    }
}

// ============================================
// TOGGLE MODULE (Expand/Collapse)
// ============================================
function toggleModule(moduleId) {
    const module = document.getElementById(moduleId);
    const icon = document.getElementById('icon-' + moduleId);
    
    if (module.classList.contains('hidden')) {
        module.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        module.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

window.toggleModule = toggleModule;

// ============================================
// HANDLE ENROLLMENT
// ============================================
function handleEnrollment() {
    if (!currentCourse) {
        alert('Course data not loaded');
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please login to enroll');
        window.location.href = 'login.html';
        return;
    }
    
    // For now, redirect to payment page (we'll build this next)
    console.log('📚 Enrolling in course:', currentCourse.courseId);
    alert(`Enrollment feature coming soon!\nCourse: ${currentCourse.title}\nPrice: ₹${currentCourse.discountedPrice}`);
    
    // TODO: Redirect to payment page
    // window.location.href = `payment.html?courseId=${currentCourse.courseId}`;
}

window.handleEnrollment = handleEnrollment;

// ============================================
// INITIALIZE
// ============================================
auth.onAuthStateChanged(async (user) => {
    // Load course details (works for both logged in and guest users)
    await loadCourseDetails();
});

console.log('✅ Course Detail page loaded');
