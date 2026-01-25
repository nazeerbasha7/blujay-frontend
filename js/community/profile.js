/**
 * PROFILE.JS
 * 
 * Handles profile creation and updates for RECEIVER and GIVER roles
 * 
 * FUNCTIONS:
 * - loadProfile(role) - Load existing profile
 * - saveProfile(role) - Save/update profile
 * - validateProfile(role) - Validate form data
 */

// API Base URL (adjust if needed)
const API_BASE = '';  // Empty means same origin

/**
 * Load existing profile from server
 */
async function loadProfile(role) {
    try {
        const response = await fetch(`${API_BASE}/api/profile/my-profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.hasProfile) {
                populateForm(data.profile, role);
            }
        } else if (response.status === 404) {
            // No profile yet - this is fine
            console.log('No profile found. User will create one.');
        } else {
            console.error('Error loading profile:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

/**
 * Populate form with existing profile data
 */
function populateForm(profile, role) {
    // Common fields
    document.getElementById('fullName').value = profile.fullName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('mobileNumber').value = profile.mobileNumber || '';

    if (role === 'RECEIVER') {
        // Receiver-specific fields
        document.getElementById('currentRole').value = profile.currentRole || '';
        document.getElementById('experienceYears').value = profile.experienceYears || '';
        document.getElementById('primarySkill').value = profile.primarySkill || '';
        document.getElementById('skills').value = profile.skills ? profile.skills.join(', ') : '';
        document.getElementById('currentLocation').value = profile.currentLocation || '';
        document.getElementById('preferredLocations').value = profile.preferredLocations ? profile.preferredLocations.join(', ') : '';
        document.getElementById('noticePeriod').value = profile.noticePeriod || '';
        document.getElementById('expectedSalary').value = profile.expectedSalary || '';
        document.getElementById('linkedinProfile').value = profile.linkedinProfile || '';
        document.getElementById('portfolioUrl').value = profile.portfolioUrl || '';
        document.getElementById('resume').value = profile.resume || '';
        document.getElementById('bio').value = profile.bio || '';
    } else if (role === 'GIVER') {
        // Giver-specific fields
        document.getElementById('companyName').value = profile.companyName || '';
        document.getElementById('companyWebsite').value = profile.companyWebsite || '';
        document.getElementById('companySize').value = profile.companySize || '';
        document.getElementById('industry').value = profile.industry || '';
        document.getElementById('designation').value = profile.designation || '';
        document.getElementById('location').value = profile.location || '';
        document.getElementById('primaryHiringSkill').value = profile.primaryHiringSkill || '';
        document.getElementById('hiringFor').value = profile.hiringFor ? profile.hiringFor.join(', ') : '';
        document.getElementById('experienceMin').value = profile.experienceRangeNeeded?.min || 0;
        document.getElementById('experienceMax').value = profile.experienceRangeNeeded?.max || 10;
        document.getElementById('linkedinProfile').value = profile.linkedinProfile || '';
        document.getElementById('bio').value = profile.bio || '';
        document.getElementById('lookingFor').value = profile.lookingFor || '';
    }
}

/**
 * Save/update profile
 */
async function saveProfile(role) {
    const messageDiv = document.getElementById('messageDiv');
    const submitBtn = document.getElementById('submitBtn');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        let profileData = {};

        if (role === 'RECEIVER') {
            profileData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                mobileNumber: document.getElementById('mobileNumber').value.trim(),
                currentRole: document.getElementById('currentRole').value.trim(),
                experienceYears: parseInt(document.getElementById('experienceYears').value),
                primarySkill: document.getElementById('primarySkill').value.trim(),
                skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
                currentLocation: document.getElementById('currentLocation').value.trim(),
                preferredLocations: document.getElementById('preferredLocations').value.split(',').map(s => s.trim()).filter(s => s),
                noticePeriod: document.getElementById('noticePeriod').value,
                expectedSalary: document.getElementById('expectedSalary').value.trim(),
                linkedinProfile: document.getElementById('linkedinProfile').value.trim(),
                portfolioUrl: document.getElementById('portfolioUrl').value.trim(),
                resume: document.getElementById('resume').value.trim(),
                bio: document.getElementById('bio').value.trim()
            };
        } else if (role === 'GIVER') {
            profileData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                mobileNumber: document.getElementById('mobileNumber').value.trim(),
                companyName: document.getElementById('companyName').value.trim(),
                companyWebsite: document.getElementById('companyWebsite').value.trim(),
                companySize: document.getElementById('companySize').value,
                industry: document.getElementById('industry').value.trim(),
                designation: document.getElementById('designation').value.trim(),
                location: document.getElementById('location').value.trim(),
                primaryHiringSkill: document.getElementById('primaryHiringSkill').value.trim(),
                hiringFor: document.getElementById('hiringFor').value.split(',').map(s => s.trim()).filter(s => s),
                experienceRangeNeeded: {
                    min: parseInt(document.getElementById('experienceMin').value),
                    max: parseInt(document.getElementById('experienceMax').value)
                },
                linkedinProfile: document.getElementById('linkedinProfile').value.trim(),
                bio: document.getElementById('bio').value.trim(),
                lookingFor: document.getElementById('lookingFor').value.trim()
            };
        }

        // Validate
        const validation = validateProfile(profileData, role);
        if (!validation.valid) {
            showMessage(messageDiv, validation.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Profile';
            return;
        }

        // Send to server
        const endpoint = role === 'RECEIVER' ? '/api/profile/receiver' : '/api/profile/giver';
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(messageDiv, data.message, 'success');
            
            // Redirect to verification pending page
            setTimeout(() => {
                window.location.href = 'verification-pending.html';
            }, 1500);
        } else {
            showMessage(messageDiv, data.error || 'Failed to save profile', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Profile';
        }

    } catch (error) {
        console.error('Error saving profile:', error);
        showMessage(messageDiv, 'An error occurred. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile';
    }
}

/**
 * Validate profile data
 */
function validateProfile(data, role) {
    // Common validation
    if (!data.fullName || data.fullName.length < 2) {
        return { valid: false, message: 'Please enter a valid full name' };
    }

    if (!data.email || !isValidEmail(data.email)) {
        return { valid: false, message: 'Please enter a valid email address' };
    }

    if (!data.mobileNumber || data.mobileNumber.length < 10) {
        return { valid: false, message: 'Please enter a valid mobile number' };
    }

    if (role === 'RECEIVER') {
        if (!data.currentRole) {
            return { valid: false, message: 'Please enter your current role' };
        }
        if (!data.experienceYears || data.experienceYears < 0) {
            return { valid: false, message: 'Please enter valid years of experience' };
        }
        if (!data.primarySkill) {
            return { valid: false, message: 'Please enter your primary skill' };
        }
        if (!data.currentLocation) {
            return { valid: false, message: 'Please enter your current location' };
        }
        if (!data.noticePeriod) {
            return { valid: false, message: 'Please select your notice period' };
        }
    } else if (role === 'GIVER') {
        if (!data.companyName) {
            return { valid: false, message: 'Please enter company name' };
        }
        if (!data.companySize) {
            return { valid: false, message: 'Please select company size' };
        }
        if (!data.industry) {
            return { valid: false, message: 'Please enter industry' };
        }
        if (!data.designation) {
            return { valid: false, message: 'Please enter your designation' };
        }
        if (!data.location) {
            return { valid: false, message: 'Please enter location' };
        }
        if (!data.primaryHiringSkill) {
            return { valid: false, message: 'Please enter primary hiring skill' };
        }
    }

    return { valid: true };
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show message to user
 */
function showMessage(element, message, type) {
    const bgColor = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
    
    element.innerHTML = `
        <div class="${bgColor} border-l-4 p-4 rounded">
            <p>${message}</p>
        </div>
    `;
    
    // Scroll to message
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
