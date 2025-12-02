// ============================================
// COURSE DETAIL PAGE - Blujay Technologies
// ============================================

console.log('🚀 Starting course-detail.js...');

const auth = firebase.auth();
const API_URL = 'https://blujay-backend.onrender.com/api';
//const API_URL = 'http://localhost:5000/api';

let currentCourse = null;
let currentCurriculum = null;

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id') || urlParams.get('courseId');

console.log('📌 Course ID:', courseId);
console.log('📡 API URL:', API_URL);

if (!courseId) {
    alert('No course selected');
    window.location.href = 'courses.html';
}

// ============================================
// AUTHENTICATED FETCH
// ============================================
async function authenticatedFetch(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📤 Fetching:', `${API_URL}${endpoint}`);
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        console.log('📥 Response:', response.status, response.statusText);
        return response;
    } catch (error) {
        console.error('❌ FETCH ERROR:', error);
        throw error;
    }
}

// ============================================
// LOAD COURSE DETAILS
// ============================================
async function loadCourseDetails() {
    console.log('🔄 Loading course details...');
    
    try {
        const response = await authenticatedFetch(`/courses/${courseId}/full`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        if (data.success) {
            currentCourse = data.course;
            currentCurriculum = data.curriculum;
            
            displayCourseDetails(data.course, data.curriculum, data.stats);
        } else {
            throw new Error(data.message || 'Failed to load course');
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error);
        
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
                    <p class="text-red-600 font-bold text-xl mb-2">Failed to Load Course</p>
                    <p class="text-gray-800 mb-2">${error.message}</p>
                    <p class="text-gray-600 text-sm mb-4">Course ID: ${courseId}</p>
                    
                    <div class="bg-yellow-50 border border-yellow-300 rounded p-4 mb-4 text-left max-w-2xl mx-auto">
                        <p class="text-yellow-800 font-bold mb-2">🔍 Check:</p>
                        <ol class="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
                            <li>Backend running on localhost:5000?</li>
                            <li>Course exists in database?</li>
                            <li>CORS enabled on backend?</li>
                        </ol>
                    </div>
                    
                    <div class="flex gap-3 justify-center">
                        <a href="courses.html" class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Back to Courses
                        </a>
                        <button onclick="location.reload()" class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// ============================================
// DISPLAY COURSE DETAILS
// ============================================
function displayCourseDetails(course, curriculum, stats) {
    console.log('🎨 Displaying course...');
    
    const loadingState = document.getElementById('loading-state');
    const mainContent = document.getElementById('main-content');
    
    if (loadingState) loadingState.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
    
    document.title = `${course.title} - Blujay Technologies`;
    
    const updateElement = (id, content) => {
        const el = document.getElementById(id);
        if (el) el.textContent = content;
    };
    
    updateElement('course-title', course.title);
    updateElement('course-description', course.description);
    updateElement('course-rating', course.rating || '4.8');
    updateElement('course-students', `(${course.students || 1234} students)`);
    updateElement('course-duration', course.duration || 'Self-paced');
    updateElement('course-level', course.level || 'Beginner');
    updateElement('course-instructor', course.instructor || 'Blujay Technologies');
    updateElement('course-description-full', course.description);
    
    const thumbnail = document.getElementById('course-thumbnail');
    if (thumbnail) thumbnail.src = course.thumbnail || 'https://via.placeholder.com/400x225';
    
    const discountPriceEl = document.getElementById('discount-price');
    const originalPriceEl = document.getElementById('original-price');
    
    if (discountPriceEl) discountPriceEl.textContent = `₹${course.discountedPrice.toLocaleString()}`;
    if (originalPriceEl) originalPriceEl.textContent = `₹${course.price.toLocaleString()}`;
    
    const discount = Math.round(((course.price - course.discountedPrice) / course.price) * 100);
    const discountBadgeEl = document.getElementById('discount-badge');
    if (discount > 0 && discountBadgeEl) {
        discountBadgeEl.textContent = `${discount}% OFF`;
    }
    
    updateElement('total-modules', stats.totalModules || 0);
    updateElement('total-videos', stats.totalVideos || 0);
    
    renderCurriculum(curriculum, stats.freeVideos);
    
    console.log('✅ Course displayed successfully!');
}

// ============================================
// RENDER CURRICULUM
// ============================================
function renderCurriculum(curriculum, freeVideosCount) {
    const container = document.getElementById('curriculum-container');
    
    if (!container) return;
    
    if (!curriculum || curriculum.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No curriculum available yet</p>';
        return;
    }
    
    container.innerHTML = curriculum.map((module, index) => `
        <div class="border border-gray-200 rounded-lg">
            <div class="module-header flex items-center justify-between" onclick="toggleModule('module-${index}')">
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
                                <p class="text-xs text-gray-500">${video.duration || '5 min'}</p>
                            </div>
                        </div>
                        ${video.isFree ? '<span class="text-xs font-semibold text-green-600">FREE PREVIEW</span>' : '<i class="fas fa-lock text-gray-400"></i>'}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function toggleModule(moduleId) {
    const module = document.getElementById(moduleId);
    const icon = document.getElementById('icon-' + moduleId);
    
    if (module && icon) {
        if (module.classList.contains('hidden')) {
            module.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
        } else {
            module.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
        }
    }
}

window.toggleModule = toggleModule;

// ============================================
// HANDLE ENROLLMENT
// ============================================
function handleEnrollment() {
    console.log('🔘 Enroll clicked!');
    
    if (!currentCourse) {
        alert('Course not loaded. Please wait.');
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.log('⚠️ Not logged in → Redirect to login');
        alert('Please login to enroll');
        window.location.href = `login.html?redirect=course-detail&courseId=${courseId}`;
        return;
    }
    
    console.log('💳 Logged in → Start payment');
    initiatePayment();
}

async function initiatePayment() {
    try {
        const response = await authenticatedFetch('/payments/create-order', {
            method: 'POST',
            body: JSON.stringify({ courseId: currentCourse.courseId })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (errorData.message && errorData.message.includes('already enrolled')) {
                alert('Already enrolled!');
                window.location.href = 'my-learning.html';
                return;
            }
            
            throw new Error(errorData.message || 'Payment failed');
        }
        
        const orderData = await response.json();
        
        if (orderData.success) {
            console.log('✅ Order created');
            openRazorpayCheckout(orderData);
        }
        
    } catch (error) {
        console.error('❌ Payment error:', error);
        alert('Error: ' + error.message);
    }
}

function openRazorpayCheckout(orderData) {
    const userName = localStorage.getItem('userName') || 'Student';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'Blujay Technologies',
        description: currentCourse.title,
        image: 'logo.png',
        order_id: orderData.orderId,
        handler: async function (response) {
            console.log('✅ Payment successful');
            await verifyPayment(response);
        },
        prefill: {
            name: userName,
            email: userEmail,
            contact: ''
        },
        notes: {
            courseId: currentCourse.courseId,
            courseName: currentCourse.title
        },
        theme: {
            color: '#1D5D7F'
        },
        modal: {
            ondismiss: function() {
                console.log('⚠️ Payment cancelled');
                alert('Payment cancelled');
            }
        }
    };
    
    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        alert('Payment failed: ' + response.error.description);
    });
    
    rzp.open();
}

async function verifyPayment(paymentResponse) {
    try {
        const response = await authenticatedFetch('/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                courseId: currentCourse.courseId,
                amount: currentCourse.discountedPrice
            })
        });
        
        if (!response.ok) {
            throw new Error('Verification failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Payment verified!');
            alert('🎉 Enrollment successful!');
            
            setTimeout(() => {
                window.location.href = 'my-learning.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Verification error:', error);
        alert('Verification failed. Contact support with payment ID: ' + paymentResponse.razorpay_payment_id);
    }
}

window.handleEnrollment = handleEnrollment;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');
    const enrollBtn = document.getElementById('enroll-btn');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', handleEnrollment);
        console.log('✅ Enroll button attached');
    }
});

auth.onAuthStateChanged(async (user) => {
    console.log('🔐 Auth:', user ? 'LOGGED IN' : 'GUEST');
    await loadCourseDetails();
});

console.log('✅ course-detail.js loaded');
