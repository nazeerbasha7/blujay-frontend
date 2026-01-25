// ============================================
// COURSE DETAIL PAGE - Blujay Technologies
// ============================================

console.log('🚀 Starting course-detail.js...');

const auth = firebase.auth();
// Smart API URL - Auto-detects environment
const API_URL = window.API_CONFIG?.getApiUrl() || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api' 
        : 'https://blujay-backend.onrender.com/api');

let currentCourse = null;
let currentCurriculum = null;
let isAlreadyEnrolled = false;
let currentEnrollment = null;

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
        // Load course data
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
            
            // Check if user is already enrolled
            await checkEnrollmentStatus();
            
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
                            <li>Backend server running on Render?</li>
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
// CHECK ENROLLMENT STATUS
// ============================================
async function checkEnrollmentStatus() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.log('⚠️ User not logged in, skipping enrollment check');
        isAlreadyEnrolled = false;
        return;
    }
    
    try {
        console.log('🔍 Checking enrollment status...');
        const response = await authenticatedFetch('/enrollments/my-courses');
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.enrollments) {
                // Check if user is enrolled in this course
                currentEnrollment = data.enrollments.find(
                    enroll => enroll.courseId === currentCourse.courseId
                );
                
                isAlreadyEnrolled = !!currentEnrollment;
                
                if (isAlreadyEnrolled) {
                    console.log('✅ User is already enrolled in this course');
                } else {
                    console.log('ℹ️ User is not enrolled in this course');
                }
            }
        }
    } catch (error) {
        console.error('❌ Error checking enrollment:', error);
        isAlreadyEnrolled = false;
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
    const discountBadgeEl = document.getElementById('discount-badge');
    const pricingSection = document.getElementById('pricing-section');
    
    // Check if course is FREE (from MongoDB isFree field)
    const isFree = course.isFree === true;
    
    if (isFree) {
        // Show only big strikethrough price
        if (discountPriceEl) {
            discountPriceEl.textContent = `₹${course.price.toLocaleString()}`;
            discountPriceEl.className = 'text-4xl font-bold text-gray-800 line-through';
        }
        
        if (originalPriceEl) {
            originalPriceEl.style.display = 'none';
        }
        
        // Replace discount badge with RED FREE badge
        if (discountBadgeEl) {
            discountBadgeEl.className = 'inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg';
            discountBadgeEl.innerHTML = `
                <i class="fas fa-gift"></i>
                100% FREE
            `;
        }
        
        // Update enroll button
        const enrollBtn = document.getElementById('enroll-btn');
        if (enrollBtn) {
            enrollBtn.textContent = 'Enroll Now';
        }
    } else {
        // Regular paid course display
        if (discountPriceEl) {
            discountPriceEl.textContent = `₹${course.discountedPrice.toLocaleString()}`;
            discountPriceEl.className = 'text-4xl font-bold text-blue-600';
        }
        if (originalPriceEl) {
            originalPriceEl.textContent = `₹${course.price.toLocaleString()}`;
            originalPriceEl.style.display = '';
        }
        
        const discount = Math.round(((course.price - course.discountedPrice) / course.price) * 100);
        if (discount > 0 && discountBadgeEl) {
            discountBadgeEl.textContent = `${discount}% OFF`;
        }
    }
    
    // Update enrollment button based on status
    updateEnrollmentButton();
    
    updateElement('total-modules', stats.totalModules || 0);
    updateElement('total-videos', stats.totalVideos || 0);
    
    renderCurriculum(curriculum, stats.freeVideos);
    
    console.log('✅ Course displayed successfully!');
}

// ============================================
// UPDATE ENROLLMENT BUTTON
// ============================================
function updateEnrollmentButton() {
    const enrollBtn = document.getElementById('enroll-btn');
    const enrollBtnContainer = document.getElementById('enroll-btn-container');
    
    if (!enrollBtn) return;
    
    if (isAlreadyEnrolled) {
        // User is already enrolled - show "Go to Course" button
        enrollBtn.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            Already Enrolled - Go to Course
        `;
        enrollBtn.className = 'w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center';
        enrollBtn.onclick = function() {
            window.location.href = 'my-learning.html';
        };
        
        // Add enrolled badge above button if container exists
        if (enrollBtnContainer) {
            const existingBadge = document.getElementById('enrolled-badge');
            if (!existingBadge) {
                const badge = document.createElement('div');
                badge.id = 'enrolled-badge';
                badge.className = 'bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4 text-center';
                badge.innerHTML = `
                    <i class="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                    <p class="text-green-800 font-bold text-lg">You're Enrolled!</p>
                    <p class="text-green-600 text-sm">Progress: ${currentEnrollment?.progress || 0}%</p>
                `;
                enrollBtnContainer.insertBefore(badge, enrollBtn);
            }
        }
        
        console.log('✅ Button updated: Already Enrolled');
    } else {
        // User not enrolled - show "Enroll Now" button
        enrollBtn.innerHTML = `
            <i class="fas fa-graduation-cap mr-2"></i>
            Enroll Now
        `;
        enrollBtn.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center';
        enrollBtn.onclick = handleEnrollment;
        
        // Remove enrolled badge if exists
        const existingBadge = document.getElementById('enrolled-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        console.log('✅ Button updated: Enroll Now');
    }
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
    
    // Check if already enrolled
    if (isAlreadyEnrolled) {
        console.log('✅ Already enrolled, redirecting to My Learning');
        window.location.href = 'my-learning.html';
        return;
    }
    
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
    
    console.log('✅ Logged in → Opening callback form (Payment gateway temporarily disabled)');
    // TEMPORARY: For this version, use callback form instead of payment
    // initiatePayment(); // ← Payment gateway - will re-enable in future version
    openEnrollmentCallbackModal();
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

// ============================================
// ENROLLMENT CALLBACK MODAL FUNCTIONS
// ============================================
const SHEETDB_URL = 'https://sheetdb.io/api/v1/7s7xiynldn2sf';

function openEnrollmentCallbackModal() {
    const modal = document.getElementById('enrollmentCallbackModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    
    // Pre-fill course info
    document.getElementById('enrollmentCourseId').value = currentCourse.courseId;
    document.getElementById('enrollmentCourseName').value = currentCourse.title;
    
    // Pre-fill user info if available
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userName) document.getElementById('enrollmentName').value = userName;
    if (userEmail) document.getElementById('enrollmentEmail').value = userEmail;
    
    // Reset messages
    document.getElementById('enrollmentSuccessMessage').classList.add('hidden');
    document.getElementById('enrollmentErrorMessage').classList.add('hidden');
    
    console.log('✅ Enrollment callback modal opened');
}

function closeEnrollmentCallbackModal() {
    const modal = document.getElementById('enrollmentCallbackModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Close dropdown if open
    const dropdownMenu = document.getElementById('enrollmentServiceDropdownMenu');
    const dropdownTrigger = document.getElementById('enrollmentServiceDropdownTrigger');
    if (dropdownMenu && dropdownTrigger) {
        dropdownMenu.classList.remove('active');
        dropdownTrigger.classList.remove('active');
    }
    
    console.log('✅ Enrollment callback modal closed');
}

window.openEnrollmentCallbackModal = openEnrollmentCallbackModal;
window.closeEnrollmentCallbackModal = closeEnrollmentCallbackModal;

// Close modal when clicking outside
document.getElementById('enrollmentCallbackModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeEnrollmentCallbackModal();
    }
});

// Custom dropdown functionality
const enrollmentServiceDropdownTrigger = document.getElementById('enrollmentServiceDropdownTrigger');
const enrollmentServiceDropdownMenu = document.getElementById('enrollmentServiceDropdownMenu');
const enrollmentServiceSelectedText = document.getElementById('enrollmentServiceSelectedText');
const enrollmentServiceHiddenSelect = document.getElementById('enrollmentServiceHiddenSelect');

enrollmentServiceDropdownTrigger?.addEventListener('click', function(e) {
    e.stopPropagation();
    const isActive = enrollmentServiceDropdownMenu.classList.contains('active');
    
    if (isActive) {
        enrollmentServiceDropdownMenu.classList.remove('active');
        enrollmentServiceDropdownTrigger.classList.remove('active');
    } else {
        enrollmentServiceDropdownMenu.classList.add('active');
        enrollmentServiceDropdownTrigger.classList.add('active');
    }
});

// Handle dropdown item selection
document.querySelectorAll('#enrollmentServiceDropdownMenu .service-dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const value = this.getAttribute('data-value');
        const text = this.querySelector('span').textContent;
        
        enrollmentServiceSelectedText.textContent = text;
        enrollmentServiceSelectedText.classList.remove('placeholder');
        enrollmentServiceSelectedText.classList.add('selected-text');
        
        enrollmentServiceHiddenSelect.value = value;
        
        document.querySelectorAll('#enrollmentServiceDropdownMenu .service-dropdown-item').forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
        
        enrollmentServiceDropdownMenu.classList.remove('active');
        enrollmentServiceDropdownTrigger.classList.remove('active');
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (enrollmentServiceDropdownMenu && enrollmentServiceDropdownTrigger) {
        if (!enrollmentServiceDropdownTrigger.contains(e.target) && !enrollmentServiceDropdownMenu.contains(e.target)) {
            enrollmentServiceDropdownMenu.classList.remove('active');
            enrollmentServiceDropdownTrigger.classList.remove('active');
        }
    }
});

// Handle Form Submission
document.getElementById('enrollmentCallbackForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('enrollmentSubmitBtn');
    const successMsg = document.getElementById('enrollmentSuccessMessage');
    const errorMsg = document.getElementById('enrollmentErrorMessage');
    
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');
    
    submitBtn.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Processing...';
    
    const formData = new FormData(this);
    const courseId = formData.get('courseId');
    const courseName = formData.get('courseName');
    
    const sheetData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        courseId: courseId,
        courseName: courseName,
        service: formData.get('service') || 'Course Enrollment',
        timestamp: new Date().toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        }),
        type: 'Course Enrollment Request',
        status: 'Pending'
    };
    
    try {
        // Step 1: Send to SheetDB
        console.log('📊 Sending to SheetDB...');
        const sheetResponse = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [sheetData] })
        });
        
        if (!sheetResponse.ok) {
            throw new Error('Failed to save request');
        }
        
        console.log('✅ SheetDB: Request saved');
        
        // Step 2: Create enrollment in backend
        console.log('📝 Creating enrollment in backend...');
        const enrollResponse = await authenticatedFetch('/enrollments/callback-enroll', {
            method: 'POST',
            body: JSON.stringify({ courseId: courseId })
        });
        
        if (!enrollResponse.ok) {
            const errorData = await enrollResponse.json().catch(() => ({}));
            
            // If already enrolled, that's okay - just redirect
            if (errorData.message && errorData.message.includes('already enrolled')) {
                console.log('⚠️ Already enrolled');
                successMsg.classList.remove('hidden');
                successMsg.innerHTML = '<i class="fas fa-info-circle mr-1"></i><strong>Already Enrolled!</strong> Redirecting...';
                
                setTimeout(() => {
                    window.location.href = 'my-learning.html';
                }, 1500);
                return;
            }
            
            throw new Error(errorData.message || 'Enrollment failed');
        }
        
        const enrollData = await enrollResponse.json();
        console.log('✅ Enrollment created:', enrollData);
        
        // Success!
        successMsg.classList.remove('hidden');
        this.reset();
        
        // Redirect to my-learning after 2 seconds
        setTimeout(() => {
            window.location.href = 'my-learning.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error:', error);
        errorMsg.classList.remove('hidden');
        errorMsg.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i><strong>Error!</strong> ${error.message}`;
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('span').textContent = 'Request Access Now';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEnrollmentCallbackModal();
    }
});

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
