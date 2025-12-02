// ============================================
// FIREBASE CONFIGURATION
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
console.log('🔗 Backend API URL:', API_URL);

// ============================================
// SET PERMANENT LOGIN PERSISTENCE
// ============================================
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Persistence set to LOCAL - User will stay logged in permanently');
    })
    .catch((error) => {
        console.error('❌ Error setting persistence:', error);
    });

// Global variables
let recaptchaVerifier;
let confirmationResult;

// ============================================
// VERIFY USER WITH BACKEND
// ============================================
async function verifyUserWithBackend(firebaseUser) {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 STEP 1: Starting backend verification...');
        console.log('📧 User Email:', firebaseUser.email || 'N/A');
        console.log('📱 User Phone:', firebaseUser.phoneNumber || 'N/A');
        
        // Get Firebase ID token
        console.log('🔄 STEP 2: Getting Firebase ID token...');
        const idToken = await firebaseUser.getIdToken();
        console.log('✅ Firebase ID token obtained');
        
        // Send to backend
        console.log('🔄 STEP 3: Sending verification request to backend...');
        console.log('📡 API Endpoint:', `${API_URL}/auth/verify`);
        
        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                name: firebaseUser.displayName || firebaseUser.phoneNumber || 'User',
                profilePhoto: firebaseUser.photoURL || ''
            })
        });
        
        console.log('✅ Backend response received');
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Backend verification failed:', errorData);
            throw new Error(errorData.message || 'Backend verification failed');
        }
        
        const data = await response.json();
        console.log('✅ STEP 4: Backend verification successful!');
        
        if (data.success) {
            // Store JWT token and user info in localStorage
            console.log('🔄 STEP 5: Storing user data in localStorage...');
            localStorage.setItem('authToken', data.jwtToken);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.uid);
            localStorage.setItem('userPhoto', data.user.profilePhoto);
            
            console.log('✅ User data stored successfully');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('👤 USER DETAILS:');
            console.log('   • Name:', data.user.name);
            console.log('   • Email:', data.user.email);
            console.log('   • Role:', data.user.role);
            console.log('   • UID:', data.user.uid);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Redirect based on role from backend
            console.log('🔄 STEP 6: Redirecting user based on role...');
            redirectUserByRole(data.user.role);
        } else {
            throw new Error(data.message || 'Verification failed');
        }
        
    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ BACKEND VERIFICATION ERROR:');
        console.error('   Message:', error.message);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        alert(
            '⚠️ Authentication Error\n\n' +
            'Error: ' + error.message + '\n\n' +
            'Please ensure:\n' +
            '1. Backend server is running\n' +
            '2. MongoDB is connected\n' +
            '3. Firebase Admin SDK is configured correctly\n\n' +
            'Check browser console for detailed logs.'
        );
        
        // Sign out Firebase user on error
        auth.signOut();
    }
}

// ============================================
// REDIRECT USER BY ROLE (FROM BACKEND)
// ============================================
function redirectUserByRole(role) {
    const currentPath = window.location.pathname;
    
    console.log('🎯 REDIRECT LOGIC:');
    console.log('   • Current Path:', currentPath);
    console.log('   • User Role:', role);
    
    // If on login/signup/index page, redirect to dashboard
    if (currentPath.includes('login.html') || 
        currentPath.includes('signup.html') || 
        currentPath === '/' || 
        currentPath.includes('index.html')) {
        
        if (role === 'admin') {
            console.log('✅ Redirecting to: admin/admin-dashboard.html');
            window.location.href = 'admin/admin-dashboard.html';
        } else {
            console.log('✅ Redirecting to: dashboard.html');
            window.location.href = 'dashboard.html';
        }
    } else {
        console.log('ℹ️ Already on dashboard, staying on current page');
    }
}

// ============================================
// CHECK AUTH STATE (IMPROVED WITH BACKEND)
// ============================================
function checkAuthState() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ Firebase user authenticated');
            console.log('📧 Email:', user.email || 'N/A');
            console.log('📱 Phone:', user.phoneNumber || 'N/A');
            console.log('🔄 Initiating backend verification...');
            
            // Verify with backend
            await verifyUserWithBackend(user);
            
        } else {
            console.log('ℹ️ No user logged in');
            
            // Clear all stored tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('userPhoto');
            
            const currentPath = window.location.pathname;
            
            // Redirect to login if on protected pages
            if (currentPath.includes('dashboard.html') || 
                currentPath.includes('my-learning.html') || 
                currentPath.includes('course-player.html') ||
                currentPath.includes('admin/')) {
                
                console.log('🔄 Protected page detected - redirecting to login...');
                const redirectTo = currentPath.includes('admin/') ? '../login.html' : 'login.html';
                window.location.href = redirectTo;
            }
        }
    });
}

// ============================================
// INITIALIZE RECAPTCHA ON PAGE LOAD
// ============================================
window.onload = function() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Blujay Technologies - Auth System');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Auth.js loaded successfully');
    console.log('🔗 Backend API:', API_URL);
    
    // Check if backend is reachable
    console.log('🔄 Testing backend connection...');
    fetch(`${API_URL.replace('/api', '')}/health`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Backend server is online');
            console.log('📡 Server message:', data.message);
        })
        .catch(error => {
            console.warn('⚠️ WARNING: Backend server not reachable!');
            console.warn('   Please start backend with: cd backend && npm start');
            console.warn('   Backend API URL:', API_URL);
        });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Initialize invisible reCAPTCHA for login page
    if (document.getElementById('recaptcha-container')) {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('✅ reCAPTCHA solved');
            },
            'expired-callback': () => {
                console.log('⚠️ reCAPTCHA expired');
            }
        });
    }
    
    // Initialize for signup page
    if (document.getElementById('recaptcha-signup-container')) {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-signup-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('✅ reCAPTCHA solved');
            }
        });
    }
    
    // Check if user is already logged in
    checkAuthState();
};

// ============================================
// PHONE LOGIN FUNCTIONALITY
// ============================================
if (document.getElementById('phone-login-form')) {
    document.getElementById('phone-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone').value.trim();
        const fullNumber = countryCode + phoneNumber;
        const submitBtn = document.getElementById('send-otp-btn');
        
        // Validation
        if (phoneNumber.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        
        // Show loading state
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        console.log('📱 Sending OTP to:', fullNumber);
        
        // Send OTP
        firebase.auth().signInWithPhoneNumber(fullNumber, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                console.log('✅ OTP sent successfully');
                
                // Prompt for OTP
                const otp = prompt('Enter the 6-digit OTP sent to ' + fullNumber);
                
                if (otp && otp.length === 6) {
                    // Verify OTP
                    submitBtn.textContent = 'Verifying...';
                    return confirmationResult.confirm(otp);
                } else {
                    throw new Error('Invalid OTP format');
                }
            })
            .then((result) => {
                console.log('✅ Phone login successful');
                // Backend verification happens in onAuthStateChanged
            })
            .catch((error) => {
                console.error('❌ Phone login error:', error);
                alert('Error: ' + error.message);
                
                // Reset button
                submitBtn.textContent = 'Login';
                submitBtn.disabled = false;
                
                // Reset reCAPTCHA
                if (recaptchaVerifier) {
                    recaptchaVerifier.clear();
                    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                        'size': 'invisible'
                    });
                }
            });
    });
}

// ============================================
// GOOGLE LOGIN FUNCTIONALITY
// ============================================
if (document.getElementById('google-login-btn')) {
    document.getElementById('google-login-btn').addEventListener('click', function() {
        console.log('🔄 Initiating Google login...');
        const provider = new firebase.auth.GoogleAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                console.log('✅ Google authentication successful');
                // Backend verification happens in onAuthStateChanged
            })
            .catch((error) => {
                console.error('❌ Google login error:', error);
                alert('Login Error: ' + error.message);
            });
    });
}

// ============================================
// PHONE NUMBER FORMATTING
// ============================================
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
});

console.log('✅ Blujay Technologies - Auth System Ready with Backend Integration!');
