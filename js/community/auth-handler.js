/**
 * COMMUNITY AUTH HANDLER
 * Handles authentication and logout for community portal
 * Ensures complete session cleanup
 */

const API_URL = window.API_CONFIG?.getApiUrl() || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api' 
        : 'https://blujay-backend.onrender.com/api');

/**
 * Complete Logout - Clears ALL authentication data
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all localStorage items
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('token'); // Legacy token
        
        // Clear all sessionStorage items
        sessionStorage.removeItem('loginContext');
        sessionStorage.removeItem('requestedProfile');
        sessionStorage.removeItem('creatingProfile');
        
        // Clear entire storage (nuclear option)
        localStorage.clear();
        sessionStorage.clear();
        
        console.log('✅ Complete logout - all auth data cleared');
        
        // Redirect to login page
        window.location.href = '../login.html';
    }
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.log('❌ No auth token found - redirecting to login');
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

/**
 * Get current user profile from API
 */
async function getCurrentUserProfile() {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/community/my-profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.profile;
        } else if (response.status === 404) {
            return null; // No profile found
        } else {
            throw new Error('Failed to fetch profile');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

/**
 * Check if user profile is verified
 */
async function checkProfileVerification() {
    const profile = await getCurrentUserProfile();
    
    if (!profile) {
        // No profile - redirect to profile creation
        window.location.href = 'index.html';
        return false;
    }
    
    if (profile.verificationStatus === 'PENDING_APPROVAL') {
        // Redirect to verification pending page
        window.location.href = 'verification-pending.html';
        return false;
    }
    
    if (profile.verificationStatus === 'REJECTED') {
        // Redirect to verification pending page (shows rejection message)
        window.location.href = 'verification-pending.html';
        return false;
    }
    
    return profile.verificationStatus === 'VERIFIED';
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleLogout,
        checkAuth,
        getCurrentUserProfile,
        checkProfileVerification
    };
}
