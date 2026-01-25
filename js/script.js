/**
 * ============================================
 * BLUJAY TECHNOLOGIES - MAIN SCRIPT
 * Complete JavaScript for Professional Website
 * ============================================
 */

// NOTE: Mobile menu and dropdown functionality is now handled in index.html inline script
// to avoid conflicts and ensure proper event handling order



// ============================================
// 3. DESKTOP MORE DROPDOWN
// ============================================


const desktopMoreBtn = document.getElementById('desktop-more-btn');
const desktopMoreMenu = document.getElementById('desktop-more-menu');
const desktopMore = document.getElementById('desktop-more');


if (desktopMoreBtn && desktopMoreMenu) {
    // Toggle dropdown on button click
    desktopMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        desktopMoreMenu.classList.toggle('hidden');
    });


    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (desktopMore && !desktopMore.contains(e.target)) {
            desktopMoreMenu.classList.add('hidden');
        }
    });


    // Close dropdown when clicking on dropdown links
    const desktopDropdownLinks = desktopMoreMenu.querySelectorAll('a');
    desktopDropdownLinks.forEach(link => {
        link.addEventListener('click', () => {
            desktopMoreMenu.classList.add('hidden');
        });
    });
}



// ============================================
// 4. SMOOTH SCROLLING WITH NAVBAR OFFSET
// ============================================


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
            // Calculate navbar height based on screen size
            const navHeight = window.innerWidth >= 1024 ? 72 : 60;
            const offsetTop = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });


            // Close mobile menu if open
            if (!mobileMenu.classList.contains('translate-x-full')) {
                mobileMenu.classList.add('translate-x-full');
                body.style.overflow = 'auto';
            }
        }
    });
});



// ============================================
// 5. NAVBAR SCROLL SHADOW EFFECT
// ============================================


let lastScroll = 0;
const navbar = document.querySelector('nav');


window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow when scrolling down
    if (currentScroll > 20) {
        navbar.classList.add('shadow-lg');
    } else {
        navbar.classList.remove('shadow-lg');
    }
    
    lastScroll = currentScroll;
});



// ============================================
// 6. ACTIVE LINK HIGHLIGHTING
// ============================================


const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');


window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const scrollPosition = window.scrollY + 100;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });


    navLinks.forEach(link => {
        link.classList.remove('border-b-2', 'border-blue-600', 'text-gray-900');
        
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('border-b-2', 'border-blue-600', 'text-gray-900');
        }
    });
});



// ============================================
// 7. PREVENT BODY SCROLL WHEN MENU OPEN
// ============================================


const preventScroll = (e) => {
    if (body.style.overflow === 'hidden') {
        e.preventDefault();
    }
};


document.addEventListener('touchmove', preventScroll, { passive: false });



// ============================================
// 8. PAGE LOAD ANIMATIONS
// ============================================


window.addEventListener('load', () => {
    // Add fade-in animation to sections
    const animatedElements = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
});



// ============================================
// 9. ANIMATED COUNTERS FOR IMPACT SECTION
// ============================================


function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const isFloat = target % 1 !== 0;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            element.textContent = isFloat ? target.toFixed(1) : Math.floor(target);
            clearInterval(timer);
        } else {
            element.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        }
    }, 16);
}


// Initialize counters on scroll into view
const counters = document.querySelectorAll('.counter');


if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const target = parseFloat(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                entry.target.classList.add('animated');
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}



// ============================================
// 10. FAQ ACCORDION FUNCTIONALITY
// ============================================


const faqItems = document.querySelectorAll('.faq-item');


faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = question.querySelector('i');
    
    question.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');
        
        // Close all other FAQs
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.querySelector('.faq-answer').classList.add('hidden');
                otherItem.querySelector('i').style.transform = 'rotate(0deg)';
                otherItem.querySelector('.faq-question').classList.remove('bg-white');
            }
        });
        
        // Toggle current FAQ
        answer.classList.toggle('hidden');
        
        if (!isOpen) {
            question.classList.add('bg-white');
            icon.style.transform = 'rotate(180deg)';
        } else {
            question.classList.remove('bg-white');
            icon.style.transform = 'rotate(0deg)';
        }
    });
});



// ============================================
// 11. COMPANY CAROUSEL ANIMATION
// ============================================


function animateCompanyCarousel() {
    const slider = document.querySelector('.company-slider');
    const track = document.querySelector('.company-track');
    
    if (!slider || !track) return;
    
    let scrollPosition = 0;
    const speed = 1; // Pixels per frame
    const trackWidth = track.scrollWidth / 2; // Half width since we duplicated items
    
    const animate = () => {
        scrollPosition += speed;
        
        if (scrollPosition >= trackWidth) {
            scrollPosition = 0;
        }
        
        track.style.transform = `translateX(-${scrollPosition}px)`;
        requestAnimationFrame(animate);
    };
    
    animate();
    
    // Pause on hover
    slider.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });
    
    slider.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
}


// Start carousel animation when page loads
window.addEventListener('load', () => {
    animateCompanyCarousel();
});



// ============================================
// 12. REQUEST CALLBACK MODAL FUNCTIONS
// ============================================

// REMOVED OLD PROMPT-BASED FUNCTION - NOW USING MODAL

function openCallbackModal() {
    const modal = document.getElementById('callbackModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

function closeCallbackModal() {
    const modal = document.getElementById('callbackModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('callbackModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCallbackModal();
            }
        });
    }
});

// Handle form submission to SheetDB
document.addEventListener('DOMContentLoaded', () => {
    const sheetdbForm = document.getElementById('sheetdb-form');
    if (sheetdbForm) {
        sheetdbForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            fetch(this.action, {
                method: "POST",
                body: new FormData(this),
            })
            .then(response => response.json())
            .then((data) => {
                alert('✅ Form submitted successfully! We will contact you soon.');
                closeCallbackModal();
                sheetdbForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            })
            .catch((error) => {
                alert('❌ Error submitting form. Please try again.');
                console.error('Error:', error);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});



// ============================================
// 13. CTA BUTTON HANDLERS
// ============================================


document.querySelectorAll('button').forEach(btn => {
    // View Courses Button
    if (btn.textContent.includes('View Courses')) {
        btn.addEventListener('click', () => {
            const coursesSection = document.querySelector('#courses');
            if (coursesSection) {
                coursesSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // View Hiring Drives Button
    if (btn.textContent.includes('View Hiring Drives')) {
        btn.addEventListener('click', () => {
            const jobsSection = document.querySelector('[id="jobs"]');
            if (jobsSection) {
                jobsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Hiring drives section coming soon!');
            }
        });
    }
    
    // Enroll Now Buttons
    if (btn.textContent.includes('Enroll Now')) {
        btn.addEventListener('click', function() {
            const courseCard = this.closest('.bg-white.rounded-2xl');
            if (courseCard) {
                const courseName = courseCard.querySelector('h3').textContent;
                const coursePrice = courseCard.querySelector('p.text-[16px] lg\\:text-[18px]')?.textContent || 'N/A';
                
                // Store in localStorage
                localStorage.setItem('enrolledCourse', JSON.stringify({
                    name: courseName,
                    price: coursePrice,
                    timestamp: new Date().toISOString()
                }));
                
                alert(`Enroll in: ${courseName}\n\nProceed to payment...`);
                // window.location.href = '/payment-gateway?course=' + encodeURIComponent(courseName);
            }
        });
    }
});



// ============================================
// 14. VIEW ALL COURSES - REDIRECT TO LOGIN
// ============================================


document.querySelectorAll('[id^="view-all-courses"]').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get course info if it's from a course card
        const courseCard = this.closest('.bg-white.rounded-2xl');
        if (courseCard) {
            const courseName = courseCard.querySelector('h3')?.textContent || 'Full Stack Development';
            
            // Store course interest
            localStorage.setItem('interestedCourse', JSON.stringify({
                name: courseName,
                timestamp: new Date().toISOString()
            }));
        }
        
        // Show loading state
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
        this.disabled = true;
        
        // Redirect to login after 300ms
        setTimeout(() => {
            window.location.href = 'login?redirect=courses';
        }, 300);
    });
});



// ============================================
// 15. NEWSLETTER SUBSCRIPTION
// ============================================


const newsletterForm = document.querySelector('form');


if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (email) {
            if (validateEmail(email)) {
                // Show success message
                const button = newsletterForm.querySelector('button');
                const originalText = button.innerHTML;
                
                button.textContent = '✓ Subscribed!';
                button.classList.add('bg-green-600');
                button.disabled = true;
                
                // Store subscription
                const subscriptionData = {
                    email: email,
                    timestamp: new Date().toISOString()
                };
                
                console.log('Newsletter Subscription:', subscriptionData);
                
                // Here you would send to your backend
                // fetch('/api/newsletter-subscribe', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(subscriptionData)
                // });
                
                // Reset after 2 seconds
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-600');
                    button.disabled = false;
                    emailInput.value = '';
                }, 2000);
            } else {
                alert('Please enter a valid email address');
            }
        }
    });
}



// ============================================
// 16. DOWNLOAD BUTTONS
// ============================================


document.querySelectorAll('button').forEach(btn => {
    // Download Brochure
    if (btn.textContent.includes('Download Brochure')) {
        btn.addEventListener('click', () => {
            downloadFile('/brochure.pdf', 'Blujay-Course-Brochure.pdf');
        });
    }
    
    // Download Placement Report
    if (btn.textContent.includes('Download Placement Report')) {
        btn.addEventListener('click', () => {
            downloadFile('/placement-report.pdf', 'Blujay-Placement-Report-2025.pdf');
        });
    }
});


function downloadFile(filePath, fileName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Downloaded:', fileName);
}



// ============================================
// 17. CONTACT US BUTTON
// ============================================


document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('Contact Our Team')) {
        btn.addEventListener('click', () => {
            const footerContact = document.querySelector('footer');
            if (footerContact) {
                footerContact.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});



// ============================================
// 18. VIDEO PLAY BUTTONS
// ============================================


document.querySelectorAll('button:has(i[class*="fa-play"])').forEach(btn => {
    btn.addEventListener('click', function() {
        const videoCard = this.closest('.bg-white.rounded-2xl');
        if (videoCard) {
            const studentName = videoCard.querySelector('h4')?.textContent || 'Student';
            const company = videoCard.querySelector('p')?.textContent || 'Company';
            
            console.log(`Playing video: ${studentName} - ${company}`);
            
            // You can replace this with actual video modal
            // Example: openVideoModal('https://youtube.com/embed/VIDEO_ID');
            alert(`Video: ${studentName}\n${company}\n\nVideo player would open here.`);
        }
    });
});



// ============================================
// 19. LOGIN BUTTON HANDLER
// ============================================


const loginButtons = document.querySelectorAll('a[href="login.html"]');
loginButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Optional: Store the page they came from
        const referrer = window.location.pathname;
        sessionStorage.setItem('referrer', referrer);
        console.log('Redirecting to login from:', referrer);
    });
});



// ============================================
// 20. SOCIAL MEDIA LINKS
// ============================================


const socialLinks = {
    facebook: 'https://facebook.com/blujay',
    twitter: 'https://twitter.com/blujay',
    linkedin: 'https://linkedin.com/company/blujay',
    instagram: 'https://instagram.com/blujay',
    youtube: 'https://youtube.com/@blujay'
};


document.querySelectorAll('a[href="#"]').forEach(link => {
    const icon = link.querySelector('i');
    if (!icon) return;
    
    if (icon.classList.contains('fa-facebook-f')) {
        link.href = socialLinks.facebook;
        link.target = '_blank';
    } else if (icon.classList.contains('fa-twitter')) {
        link.href = socialLinks.twitter;
        link.target = '_blank';
    } else if (icon.classList.contains('fa-linkedin-in')) {
        link.href = socialLinks.linkedin;
        link.target = '_blank';
    } else if (icon.classList.contains('fa-instagram')) {
        link.href = socialLinks.instagram;
        link.target = '_blank';
    } else if (icon.classList.contains('fa-youtube')) {
        link.href = socialLinks.youtube;
        link.target = '_blank';
    }
});



// ============================================
// 21. COURSE FILTER TABS
// ============================================


const courseFilterButtons = document.querySelectorAll('.flex.flex-wrap.gap-2 button, .flex.flex-wrap.gap-3 button');


courseFilterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Check if this is a course filter button
        if (!this.textContent.includes('Full Stack') && 
            !this.textContent.includes('Data') && 
            !this.textContent.includes('AI') &&
            !this.textContent.includes('Analytics')) {
            return;
        }
        
        // Remove active state from all buttons
        courseFilterButtons.forEach(btn => {
            if (btn.textContent.includes('Full Stack') || 
                btn.textContent.includes('Data') || 
                btn.textContent.includes('AI') ||
                btn.textContent.includes('Analytics')) {
                btn.classList.remove('bg-blue-600', 'bg-green-600', 'text-white', 'shadow-md');
                btn.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            }
        });
        
        // Add active state to clicked button
        this.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
        this.classList.add('bg-blue-600', 'text-white', 'shadow-md');
        
        // Filter courses
        const filterType = this.textContent.trim();
        console.log('Filter by:', filterType);
        
        // Here you would filter the course cards
        filterCourses(filterType);
    });
});


function filterCourses(filterType) {
    const courseCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2 > div');
    
    courseCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent || '';
        const isVisible = title.includes(filterType) || filterType.includes('Full Stack');
        
        card.style.display = isVisible ? 'block' : 'none';
    });
}



// ============================================
// 22. OFFLINE CENTRE TABS
// ============================================


const centreButtons = document.querySelectorAll('.space-y-2 button');


centreButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active state from all buttons
        centreButtons.forEach(btn => {
            btn.classList.remove('bg-blue-50', 'text-blue-600');
            btn.classList.add('text-gray-500');
        });
        
        // Add active state to clicked button
        this.classList.remove('text-gray-500');
        this.classList.add('bg-blue-50', 'text-blue-600');
        
        // Update centre information
        const centreName = this.textContent.trim();
        console.log('Selected centre:', centreName);
        
        // You would update centre images and info here
        updateCentreInfo(centreName);
    });
});


function updateCentreInfo(centreName) {
    console.log('Updating centre info for:', centreName);
    // Fetch and display centre-specific images and details
}



// ============================================
// 23. RESPONSIVE IMAGE OPTIMIZATION
// ============================================


// Lazy load images for better performance
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Only update if data-src exists
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}



// ============================================
// 24. MOBILE MENU CLOSE ON ESCAPE KEY
// ============================================


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
            mobileMenu.classList.add('translate-x-full');
            body.style.overflow = 'auto';
        }
        
        // Also close callback modal on Escape
        const modal = document.getElementById('callbackModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeCallbackModal();
        }
    }
});



// ============================================
// 25. FORM VALIDATION UTILITIES
// ============================================


function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/[-\s]/g, ''));
}


function validateName(name) {
    return name && name.trim().length >= 2;
}



// ============================================
// 26. ACCESSIBILITY: FOCUS VISIBLE
// ============================================


document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('tab-active');
    }
});


document.addEventListener('mousedown', () => {
    document.body.classList.remove('tab-active');
});



// ============================================
// 27. HANDLE LOGIN REDIRECT WITH PARAMS
// ============================================


// Check if redirected from a specific course
const urlParams = new URLSearchParams(window.location.search);
const redirectParam = urlParams.get('redirect');
const courseParam = urlParams.get('course');


if (redirectParam) {
    console.log('Redirected from:', redirectParam);
    // You can use this to show specific sections after login
}


if (courseParam) {
    console.log('Selected Course:', courseParam);
    localStorage.setItem('selectedCourse', courseParam);
}



// ============================================
// 28. RETRIEVE INTERESTED COURSE AFTER LOGIN
// ============================================


function getInterestedCourse() {
    const interested = localStorage.getItem('interestedCourse');
    if (interested) {
        try {
            return JSON.parse(interested);
        } catch (e) {
            console.error('Error parsing interested course:', e);
            return null;
        }
    }
    return null;
}


// On page load, check for interested course
window.addEventListener('load', () => {
    const interestedCourse = getInterestedCourse();
    if (interestedCourse) {
        console.log('User interested in:', interestedCourse.name);
        // You can use this to pre-select the course in your course listing page
    }
});



// ============================================
// 29. PERFORMANCE MONITORING
// ============================================


if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;
        
        console.log('=== Page Performance Metrics ===');
        console.log('Page Load Time:', pageLoadTime + 'ms');
        console.log('Connect Time:', connectTime + 'ms');
        console.log('Render Time:', renderTime + 'ms');
    });
}



// ============================================
// 30. DETECT USER'S BROWSER & DEVICE
// ============================================


function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android/.test(ua) && !/Mobile/.test(ua);
    
    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        userAgent: ua
    };
}


const deviceInfo = getDeviceInfo();
console.log('Device Info:', deviceInfo);



// ============================================
// 31. TRACK USER INTERACTIONS
// ============================================


function trackEvent(eventName, eventData = {}) {
    const event = {
        name: eventName,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        data: eventData
    };
    
    console.log('Event Tracked:', event);
    
    // Here you would send to your analytics service
    // Example: sendToAnalytics(event);
}


// Track page view
trackEvent('page_view', {
    page: document.title,
    referrer: document.referrer
});


// Track button clicks
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function() {
        trackEvent('button_click', {
            buttonText: this.textContent.substring(0, 50),
            buttonClass: this.className
        });
    });
});



// ============================================
// 32. SMOOTH INITIAL PAGE LOAD
// ============================================


document.documentElement.style.scrollBehavior = 'smooth';


// Hide loading state (if you have one)
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});



// ============================================
// 33. CONSOLE LOGGING & DEBUG INFO
// ============================================


console.log('%c✅ Blujay Website Ready!', 'color: #1D5D7F; font-size: 16px; font-weight: bold;');
console.log('%c📱 Mobile Menu: Fully Functional', 'color: #236192; font-size: 12px;');
console.log('%c🖥️ Desktop Navigation: Dropdown Working', 'color: #236192; font-size: 12px;');
console.log('%c📊 Animated Counters: Active', 'color: #236192; font-size: 12px;');
console.log('%c⚙️ All Features Loaded Successfully!', 'color: #1D5D7F; font-size: 14px; font-weight: bold;');
console.log('%c🚀 Enhanced with:', 'color: #236192; font-size: 12px;');
console.log('  • FAQ Accordion');
console.log('  • Company Carousel');
console.log('  • Course Filtering');
console.log('  • View All Courses Redirect');
console.log('  • Newsletter Subscription');
console.log('  • Accessibility Features');
console.log('  • Performance Monitoring');
console.log('  • Request Callback Modal');



// ============================================
// 34. EXPORT UTILITIES (Optional)
// ============================================


// Make utilities available globally if needed
window.BlujaySiteUtils = {
    validateEmail,
    validatePhone,
    validateName,
    getDeviceInfo,
    trackEvent,
    getInterestedCourse,
    downloadFile,
    openCallbackModal,
    closeCallbackModal
};


console.log('Utils available as: window.BlujaySiteUtils');
