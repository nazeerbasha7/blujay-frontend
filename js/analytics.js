/**
 * ============================================
 * GOOGLE ANALYTICS 4 - CUSTOM EVENT TRACKING
 * ============================================
 * Client-side JavaScript for tracking user interactions
 * Include this file in your HTML pages after GA4 initialization
 * ============================================
 */

// ============================================
// CORE EVENT TRACKING FUNCTION
// ============================================

/**
 * Track custom events to Google Analytics 4
 * 
 * @param {string} eventName - Name of the event (e.g., 'button_click', 'form_submit')
 * @param {Object} eventParams - Event parameters (key-value pairs)
 * 
 * @example
 * trackEvent('button_click', {
 *   button_name: 'Enroll Now',
 *   course_name: 'AWS DevOps'
 * });
 */
function trackEvent(eventName, eventParams = {}) {
    // Check if gtag is available
    if (typeof gtag === 'function') {
        // Add default parameters
        const params = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            timestamp: new Date().toISOString(),
            ...eventParams
        };

        // Send event to GA4
        gtag('event', eventName, params);
        
        console.log('📊 GA4 Event Tracked:', eventName, params);
    } else {
        console.warn('⚠️ Google Analytics not loaded. Event not tracked:', eventName);
    }
}

// ============================================
// BUTTON CLICK TRACKING
// ============================================

/**
 * Track button clicks (e.g., CTA buttons, inquiry buttons)
 * 
 * @param {string} buttonName - Name/label of the button
 * @param {Object} additionalParams - Additional event parameters
 * 
 * @example
 * trackButtonClick('Enroll Now', { course_name: 'AWS DevOps' });
 */
function trackButtonClick(buttonName, additionalParams = {}) {
    trackEvent('button_click', {
        button_name: buttonName,
        click_type: 'cta',
        ...additionalParams
    });
}

// ============================================
// FORM SUBMISSION TRACKING
// ============================================

/**
 * Track form submissions
 * 
 * @param {string} formName - Name/ID of the form
 * @param {Object} formData - Form data (non-sensitive only)
 * 
 * @example
 * trackFormSubmit('Contact Form', { form_type: 'inquiry' });
 */
function trackFormSubmit(formName, formData = {}) {
    trackEvent('form_submit', {
        form_name: formName,
        form_destination: formData.form_destination || 'contact',
        ...formData
    });
}

// ============================================
// PHONE CLICK TRACKING
// ============================================

/**
 * Track phone number clicks
 * 
 * @param {string} phoneNumber - Phone number (optional, for tracking purposes)
 * @param {string} location - Where the phone link is located (e.g., 'header', 'footer')
 * 
 * @example
 * trackPhoneClick('+91-9876543210', 'header');
 */
function trackPhoneClick(phoneNumber = 'not-specified', location = 'unknown') {
    trackEvent('phone_click', {
        phone_number: phoneNumber,
        click_location: location,
        contact_method: 'phone'
    });
}

// ============================================
// WHATSAPP CLICK TRACKING
// ============================================

/**
 * Track WhatsApp button clicks
 * 
 * @param {string} location - Where the WhatsApp button is located
 * @param {string} message - Pre-filled message (if any)
 * 
 * @example
 * trackWhatsAppClick('footer', 'Inquiry about AWS Course');
 */
function trackWhatsAppClick(location = 'unknown', message = '') {
    trackEvent('whatsapp_click', {
        click_location: location,
        contact_method: 'whatsapp',
        message_preview: message.substring(0, 50) // First 50 chars only
    });
}

// ============================================
// COURSE VIEW TRACKING
// ============================================

/**
 * Track course page views
 * 
 * @param {string} courseName - Name of the course
 * @param {string} courseCategory - Category (e.g., 'DevOps', 'Full Stack')
 * @param {Object} additionalParams - Additional course details
 * 
 * @example
 * trackCourseView('AWS DevOps', 'DevOps', { course_duration: '60 hours' });
 */
function trackCourseView(courseName, courseCategory = 'unknown', additionalParams = {}) {
    trackEvent('course_view', {
        course_name: courseName,
        course_category: courseCategory,
        content_type: 'course',
        ...additionalParams
    });
}

// ============================================
// DOWNLOAD TRACKING
// ============================================

/**
 * Track file downloads (brochures, syllabi, etc.)
 * 
 * @param {string} fileName - Name of the file being downloaded
 * @param {string} fileType - Type of file (e.g., 'brochure', 'syllabus', 'pdf')
 * @param {string} courseName - Related course name (if applicable)
 * 
 * @example
 * trackDownload('aws-devops-syllabus.pdf', 'syllabus', 'AWS DevOps');
 */
function trackDownload(fileName, fileType = 'document', courseName = '') {
    trackEvent('download_click', {
        file_name: fileName,
        file_type: fileType,
        course_name: courseName,
        link_url: window.location.href
    });
}

// ============================================
// SCROLL DEPTH TRACKING
// ============================================

/**
 * Track scroll depth (25%, 50%, 75%, 100%)
 * Call this function to set up automatic scroll tracking
 */
function initScrollTracking() {
    const scrollThresholds = [25, 50, 75, 100];
    const trackedThresholds = new Set();

    window.addEventListener('scroll', function() {
        const scrollPercentage = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        scrollThresholds.forEach(threshold => {
            if (scrollPercentage >= threshold && !trackedThresholds.has(threshold)) {
                trackedThresholds.add(threshold);
                trackEvent('scroll_depth', {
                    scroll_percentage: threshold,
                    page_title: document.title
                });
            }
        });
    });
}

// ============================================
// VIDEO TRACKING
// ============================================

/**
 * Track video interactions
 * 
 * @param {string} action - Video action ('play', 'pause', 'complete')
 * @param {string} videoTitle - Title of the video
 * @param {number} currentTime - Current playback time in seconds
 * 
 * @example
 * trackVideo('play', 'AWS Introduction Video', 0);
 */
function trackVideo(action, videoTitle, currentTime = 0) {
    trackEvent('video_' + action, {
        video_title: videoTitle,
        video_current_time: currentTime,
        video_action: action
    });
}

// ============================================
// LINK CLICK TRACKING (External Links)
// ============================================

/**
 * Track external link clicks
 * 
 * @param {string} linkUrl - URL of the external link
 * @param {string} linkText - Text of the link
 * 
 * @example
 * trackExternalLink('https://example.com', 'Visit Example');
 */
function trackExternalLink(linkUrl, linkText = '') {
    trackEvent('external_link_click', {
        link_url: linkUrl,
        link_text: linkText,
        outbound: true
    });
}

// ============================================
// SEARCH TRACKING
// ============================================

/**
 * Track search queries
 * 
 * @param {string} searchTerm - Search term entered by user
 * @param {number} resultsCount - Number of results found
 * 
 * @example
 * trackSearch('AWS DevOps', 5);
 */
function trackSearch(searchTerm, resultsCount = 0) {
    trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
    });
}

// ============================================
// AUTO-INITIALIZE TRACKING
// ============================================

// Auto-track page view when script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 GA4 Analytics.js loaded successfully');
    
    // Optional: Initialize scroll tracking automatically
    // Uncomment the line below to enable
    // initScrollTracking();
});

// ============================================
// EXPORTS (for module use)
// ============================================

// If using as a module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        trackEvent,
        trackButtonClick,
        trackFormSubmit,
        trackPhoneClick,
        trackWhatsAppClick,
        trackCourseView,
        trackDownload,
        initScrollTracking,
        trackVideo,
        trackExternalLink,
        trackSearch
    };
}
