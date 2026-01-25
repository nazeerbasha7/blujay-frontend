/**
 * COMMUNITY PORTAL LAYOUT
 * Exact navbar and footer from frontend/index.html
 */

const NAVBAR_HTML = `
<style>
    :root { --blujay-primary: #1D5D7F; }
    
    /* Premium Navbar from index.html */
    .nav-glass {
        backdrop-filter: blur(14px);
        background: rgba(255, 255, 255, 0.97);
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        transition: all 0.3s ease;
    }
    .nav-glass.scrolled { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }

    /* Desktop Dropdown */
    .dropdown { position: relative; display: inline-block; }
    .dropdown-toggle {
        display: flex; align-items: center; gap: 6px; cursor: pointer;
        transition: all 0.25s ease; background: none; border: none; padding: 0;
    }
    .dropdown-toggle i.chevron {
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 9px;
    }
    .dropdown:hover .dropdown-toggle,
    .dropdown.active .dropdown-toggle { color: var(--blujay-primary) !important; }
    .dropdown:hover .dropdown-toggle i.chevron,
    .dropdown.active .dropdown-toggle i.chevron { transform: rotate(180deg); }

    .dropdown-menu {
        position: absolute; top: calc(100% + 14px); left: 50%;
        transform: translateX(-50%) translateY(-10px); min-width: 240px;
        background: #ffffff; border-radius: 14px;
        box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.04);
        opacity: 0; visibility: hidden;
        transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000; padding: 10px;
    }
    .dropdown:hover .dropdown-menu,
    .dropdown.active .dropdown-menu {
        opacity: 1; visibility: visible;
        transform: translateX(-50%) translateY(0);
    }

    .dropdown-menu a {
        display: flex; align-items: center; padding: 11px 14px;
        color: #111827; text-decoration: none; font-size: 13px;
        font-weight: 500; transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 10px; margin-bottom: 4px; position: relative;
    }
    .dropdown-menu a:last-child { margin-bottom: 0; }
    .dropdown-menu a i {
        margin-right: 10px; font-size: 13px; width: 18px;
        text-align: center; color: var(--blujay-primary); opacity: 0.9;
    }
    .dropdown-menu a:hover {
        background: var(--blujay-primary); color: #ffffff;
        padding-left: 18px; transform: translateX(2px);
    }
    .dropdown-menu a:hover i { color: #ffffff; }

    /* Mobile Dropdowns */
    .mobile-dropdown-wrapper { border-bottom: 1px solid #e5e7eb; padding: 0; }
    .mobile-dropdown-toggle {
        width: 100%; display: flex; justify-content: space-between;
        align-items: center; cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: none; border: none; text-align: left;
        padding: 10px 0; user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
    .mobile-dropdown-toggle i.arrow {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 9px; color: #9ca3af;
    }
    .mobile-dropdown-toggle.active i.arrow {
        transform: rotate(180deg); color: var(--blujay-primary);
    }
    .mobile-dropdown-toggle.active {
        color: var(--blujay-primary); font-weight: 600;
    }

    .mobile-dropdown-content {
        display: grid; grid-template-rows: 0fr;
        transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .mobile-dropdown-content.active { grid-template-rows: 1fr; }
    .mobile-dropdown-inner { overflow: hidden; min-height: 0; }
    .mobile-dropdown-content.active .mobile-dropdown-inner {
        padding: 8px 3px 10px 3px;
    }

    .mobile-dropdown-content a {
        display: flex; align-items: center; padding: 8px 12px;
        color: #374151; background: #ffffff; margin-bottom: 5px;
        border-radius: 8px; font-size: 12.5px; font-weight: 500;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none; border: 1px solid #e5e7eb;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        user-select: none; -webkit-tap-highlight-color: transparent;
    }
    .mobile-dropdown-content a:last-child { margin-bottom: 0; }
    .mobile-dropdown-content a i {
        margin-right: 9px; font-size: 11px; width: 14px;
        text-align: center; opacity: 0.8; color: var(--blujay-primary);
    }
    .mobile-dropdown-content a:active {
        background: var(--blujay-primary) !important;
        color: #ffffff !important;
        border-color: var(--blujay-primary) !important;
        transform: scale(0.97);
    }
    .mobile-dropdown-content a:active i { opacity: 1; color: #ffffff; }

    #mobile-menu { backdrop-filter: blur(10px); }
    body.mobile-menu-open { overflow: hidden; position: fixed; width: 100%; }

    /* Navbar color overrides */
    nav .bg-blue-600 { background-color: #1D5D7F !important; }
    nav .hover\\:bg-blue-700:hover { background-color: #144A66 !important; }
    nav .border-blue-600 { border-color: #1D5D7F !important; }
    nav .text-blue-600 { color: #1D5D7F !important; }
    nav .hover\\:bg-blue-50:hover { background-color: rgba(29, 93, 127, 0.05) !important; }
</style>

<nav class="fixed w-full top-0 z-50 nav-glass" id="navbar">
    <div class="px-4 lg:px-8">
        <div class="flex justify-between items-center h-[60px] lg:h-[72px]">
            <!-- Logo -->
            <a href="../index.html" class="flex items-center">
                <img src="../logo.png" alt="Blujay Technologies" class="h-9 lg:h-12 w-auto" loading="lazy">
            </a>

            <!-- Desktop Menu -->
            <div class="hidden lg:flex items-center gap-8 ml-auto">
                

                <!-- Courses Dropdown -->
                <div class="dropdown">
                    <button class="dropdown-toggle text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                        Courses <i class="fas fa-chevron-down chevron"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="../recorded-courses.html"><i class="fas fa-video"></i>Self-Paced / Recorded Courses</a>
                        <a href="../all-courses.html"><i class="fas fa-graduation-cap"></i>All Courses</a>
                    </div>
                </div>

                <!-- Career Support Dropdown -->
                <div class="dropdown">
                    <button class="dropdown-toggle text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                        Career Support <i class="fas fa-chevron-down chevron"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="../profilepushing.html"><i class="fas fa-user-tie"></i>Profile Pushing</a>
                        <a href="../jobsupport.html"><i class="fas fa-headset"></i>Job Support</a>
                    </div>
                </div>

                <!-- Service Dropdown -->
                <div class="dropdown">
                    <button class="dropdown-toggle text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                        Service <i class="fas fa-chevron-down chevron"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="../digital-marketing-seo.html"><i class="fas fa-bullhorn"></i>Digital Marketing Services</a>
                        <a href="../services.html"><i class="fas fa-code"></i>Web Development Services</a>
                    </div>
                </div>

                <!-- About Dropdown -->
                <div class="dropdown">
                    <button class="dropdown-toggle text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                        About <i class="fas fa-chevron-down chevron"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="../aboutus.html"><i class="fas fa-info-circle"></i>About Blujay</a>
                        <a href="#"><i class="fas fa-handshake"></i>Community & Partnerships</a>
                        <a href="#"><i class="fas fa-heart"></i>Social Impact</a>
                        <a href="#"><i class="fas fa-trophy"></i>Success Stories</a>
                    </div>
                </div>

                <!-- Resource Dropdown -->
                <div class="dropdown">
                    <button class="dropdown-toggle text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                        Resource <i class="fas fa-chevron-down chevron"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="../jobroadmap.html"><i class="fas fa-map-marked-alt"></i>Roadmap</a>
                        </div>
                </div>

                <button onclick="handleLogout()" class="bg-red-500 text-white px-4 py-1.5 rounded-lg text-[12px] lg:text-[13px] font-semibold hover:bg-red-600 transition-all">Logout</button>
                <a href="../contactus.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-[12px] lg:text-[13px] font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                    <i class="fas fa-phone-alt text-[10px]"></i> Contact Us
                </a>
            </div>

            <!-- Mobile: Hamburger -->
            <div class="flex lg:hidden items-center">
                <button id="mobile-toggle" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-all">
                    <i class="fas fa-bars text-[20px] text-gray-900"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="fixed inset-0 z-[100] transform translate-x-full transition-transform duration-300 lg:hidden" style="background-color: #ffffff !important;">
        <div class="flex justify-between items-center h-[60px] px-4 border-b" style="background-color: #ffffff !important;">
            <img src="../logo.png" alt="Blujay Technologies" class="h-9" loading="lazy">
            <button id="mobile-close" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-all">
                <i class="fas fa-times text-[22px] text-gray-800"></i>
            </button>
        </div>

        <div class="overflow-y-auto h-[calc(100vh-60px)]" style="background-color: #ffffff !important;">
            <div class="px-4 py-4">
                 

                <div class="mobile-dropdown-wrapper">
                    <button class="mobile-dropdown-toggle text-[14px] font-semibold text-gray-900" type="button">
                        Courses <i class="fas fa-chevron-down arrow"></i>
                    </button>
                    <div class="mobile-dropdown-content">
                        <div class="mobile-dropdown-inner">
                            <a href="../recorded-courses.html"><i class="fas fa-video"></i>Self-Paced / Recorded Courses</a>
                            <a href="../all-courses.html"><i class="fas fa-graduation-cap"></i>All Courses</a>
                        </div>
                    </div>
                </div>

                <div class="mobile-dropdown-wrapper">
                    <button class="mobile-dropdown-toggle text-[14px] font-semibold text-gray-900" type="button">
                        Career Support <i class="fas fa-chevron-down arrow"></i>
                    </button>
                    <div class="mobile-dropdown-content">
                        <div class="mobile-dropdown-inner">
                            <a href="../profilepushing.html"><i class="fas fa-user-tie"></i>Profile Pushing</a>
                            <a href="../jobsupport.html"><i class="fas fa-headset"></i>Job Support</a>
                        </div>
                    </div>
                </div>

                <div class="mobile-dropdown-wrapper">
                    <button class="mobile-dropdown-toggle text-[14px] font-semibold text-gray-900" type="button">
                        Services <i class="fas fa-chevron-down arrow"></i>
                    </button>
                    <div class="mobile-dropdown-content">
                        <div class="mobile-dropdown-inner">
                            <a href="../digital-marketing-seo.html"><i class="fas fa-bullhorn"></i>Digital Marketing Services</a>
                            <a href="../services.html"><i class="fas fa-code"></i>Web Development Services</a>
                        </div>
                    </div>
                </div>

                <div class="mobile-dropdown-wrapper">
                    <button class="mobile-dropdown-toggle text-[14px] font-semibold text-gray-900" type="button">
                        About <i class="fas fa-chevron-down arrow"></i>
                    </button>
                    <div class="mobile-dropdown-content">
                        <div class="mobile-dropdown-inner">
                            <a href="../aboutus.html"><i class="fas fa-info-circle"></i>About Blujay</a>
                            <a href="#"><i class="fas fa-handshake"></i>Community & Partnerships</a>
                            <a href="#"><i class="fas fa-heart"></i>Social Impact</a>
                            <a href="#"><i class="fas fa-trophy"></i>Success Stories</a>
                        </div>
                    </div>
                </div>

                <div class="mobile-dropdown-wrapper">
                    <button class="mobile-dropdown-toggle text-[14px] font-semibold text-gray-900" type="button">
                        Resources <i class="fas fa-chevron-down arrow"></i>
                    </button>
                    <div class="mobile-dropdown-content">
                        <div class="mobile-dropdown-inner">
                            <a href="../jobroadmap.html"><i class="fas fa-map-marked-alt"></i>Roadmap</a>
                            </div>
                    </div>
                </div>

                <a href="../contactus.html" class="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg text-[13px] font-semibold mt-6 hover:bg-blue-700 transition-all">
                    Contact Us
                </a>

                <button onclick="handleLogout()" class="block w-full text-center bg-red-500 text-white py-2.5 rounded-lg text-[13px] font-semibold mt-3 hover:bg-red-600 transition-all">Logout</button>
            </div>
        </div>
    </div>
</nav>
`;

const FOOTER_HTML = `
<footer class="bg-[#0d1b2a] text-white py-12 lg:py-16">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
            
            <!-- Company Info -->
            <div class="lg:col-span-1 text-center lg:text-left">
                <div class="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <img src="../logo.png" alt="Blujay Technologies" class="h-10 w-auto">
                </div>
                <p class="text-sm text-gray-400 leading-relaxed mb-4">
                    Empowering careers and businesses through quality IT education and professional digital services.
                </p>
                <div class="space-y-2 text-sm text-gray-400">
                    <div class="flex items-start gap-2 justify-center lg:justify-start">
                        <i class="fas fa-map-marker-alt mt-1 flex-shrink-0"></i>
                        <span>Ameerpet, Hyderabad, India</span>
                    </div>
                    <div class="flex items-center gap-2 justify-center lg:justify-start">
                        <i class="fas fa-phone"></i>
                        <span>+91 96187 21797</span>
                    </div>
                    <div class="flex items-center gap-2 justify-center lg:justify-start">
                        <i class="fas fa-envelope"></i>
                        <span>info@blujaytech.com</span>
                    </div>
                </div>
            </div>

            <!-- Courses -->
            <div class="text-center lg:text-left">
                <h4 class="text-base font-semibold mb-4">Courses</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="../all-courses.html" class="hover:text-white transition-colors">Full Stack Development</a></li>
                    <li><a href="../all-courses.html" class="hover:text-white transition-colors">Data Science</a></li>
                    <li><a href="../all-courses.html" class="hover:text-white transition-colors">Cloud Computing</a></li>
                    <li><a href="../all-courses.html" class="hover:text-white transition-colors">Digital Marketing</a></li>
                    <li><a href="../all-courses.html" class="hover:text-white transition-colors">All Courses</a></li>
                </ul>
            </div>

            <!-- Career Support -->
            <div class="text-center lg:text-left">
                <h4 class="text-base font-semibold mb-4">Career Support</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="../profilepushing.html" class="hover:text-white transition-colors">Profile Pushing</a></li>
                    <li><a href="../jobsupport.html" class="hover:text-white transition-colors">Job Support</a></li>
                    <li><a href="../jobroadmap.html" class="hover:text-white transition-colors">Interview Preparation</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Placement Assistance</a></li>
                </ul>
            </div>

            <!-- Services -->
            <div class="text-center lg:text-left">
                <h4 class="text-base font-semibold mb-4">Services</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="../services.html" class="hover:text-white transition-colors">Digital Marketing</a></li>
                    <li><a href="../services.html" class="hover:text-white transition-colors">Web Development</a></li>
                    <li><a href="../services.html" class="hover:text-white transition-colors">SEO Services</a></li>
                    <li><a href="../services.html" class="hover:text-white transition-colors">Custom Solutions</a></li>
                </ul>
            </div>

            <!-- Company -->
            <div class="text-center lg:text-left">
                <h4 class="text-base font-semibold mb-4">Company</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="../aboutus.html" class="hover:text-white transition-colors">About Us</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
                    <li></li>
                    <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
                </ul>
            </div>

            <!-- Resources -->
            <div class="text-center lg:text-left">
                <h4 class="text-base font-semibold mb-4">Resources</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="#" class="hover:text-white transition-colors">Success Stories</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Community</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">FAQs</a></li>
                    <li><a href="#" class="hover:text-white transition-colors">Terms & Privacy</a></li>
                </ul>
            </div>

        </div>

        <!-- Bottom Section -->
        <div class="border-t border-gray-800 pt-6">
            <div class="flex flex-col lg:flex-row justify-between items-center gap-4">
                <p class="text-xs text-gray-500 text-center lg:text-left">
                     2026 Blujay Technologies. All rights reserved.
                </p>
                
                <!-- Social Media Links -->
                <div class="flex gap-3">
                    <a href="https://facebook.com/blujaytechnologies" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center hover:text-blue-500 transition-colors">
                        <i class="fab fa-facebook text-base"></i>
                    </a>
                    <a href="https://twitter.com/blujaytech" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center hover:text-blue-400 transition-colors">
                        <i class="fab fa-twitter text-base"></i>
                    </a>
                    <a href="https://linkedin.com/company/blujay-technologies" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center hover:text-blue-600 transition-colors">
                        <i class="fab fa-linkedin text-base"></i>
                    </a>
                    <a href="https://instagram.com/blujaytech" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center hover:text-pink-500 transition-colors">
                        <i class="fab fa-instagram text-base"></i>
                    </a>
                    <a href="https://youtube.com/@blujaytech" target="_blank" rel="noopener noreferrer" class="w-8 h-8 flex items-center justify-center hover:text-red-500 transition-colors">
                        <i class="fab fa-youtube text-base"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</footer>
`;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Inject navbar
    const navbarPlaceholder = document.getElementById('community-navbar');
    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = NAVBAR_HTML;
        setupNavbarEvents();
    }

    // Inject footer
    const footerPlaceholder = document.getElementById('community-footer');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = FOOTER_HTML;
    }
});

// Setup navbar functionality
function setupNavbarEvents() {
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileClose = document.getElementById('mobile-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
            document.body.classList.add('mobile-menu-open');
        });
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
            document.body.classList.remove('mobile-menu-open');
        });
    }

    // Mobile dropdowns
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content) {
                content.classList.toggle('active');
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}
