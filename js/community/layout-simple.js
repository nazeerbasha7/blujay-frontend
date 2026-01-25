/**
 * COMMUNITY PORTAL LAYOUT
 * Same styling as index.html but with community-specific links
 */

const NAVBAR_HTML = `
<style>
    :root { --blujay-primary: #1D5D7F; }
    
    /* Premium Navbar */
    .nav-glass {
        backdrop-filter: blur(14px);
        background: rgba(255, 255, 255, 0.97);
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        transition: all 0.3s ease;
    }
    .nav-glass.scrolled { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }

    /* Navbar color overrides */
    nav .bg-blue-600 { background-color: #1D5D7F !important; }
    nav .hover\\:bg-blue-700:hover { background-color: #144A66 !important; }
    nav .border-blue-600 { border-color: #1D5D7F !important; }
    nav .text-blue-600 { color: #1D5D7F !important; }
    nav .hover\\:bg-blue-50:hover { background-color: rgba(29, 93, 127, 0.05) !important; }
    
    body.mobile-menu-open { overflow: hidden; position: fixed; width: 100%; }
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
                
                <a href="index.html" class="text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">Community Home</a>
                <a href="#" id="myDashboardLink" class="text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">My Dashboard</a>
                <a href="connections.html" class="text-[13px] lg:text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors">Connections</a>

                <a href="../login.html" class="border-2 border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg text-[12px] lg:text-[13px] font-semibold hover:bg-blue-50 transition-all">Login</a>
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
                 
                <a href="index.html" class="block py-3 text-[14px] font-semibold text-gray-900 border-b">Community Home</a>
                <a href="#" id="myDashboardLinkMobile" class="block py-3 text-[14px] font-semibold text-gray-900 border-b">My Dashboard</a>
                <a href="connections.html" class="block py-3 text-[14px] font-semibold text-gray-900 border-b">Connections</a>

                <a href="../contactus.html" class="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg text-[13px] font-semibold mt-6 hover:bg-blue-700 transition-all">
                    Contact Us
                </a>

                <a href="../login.html" class="block w-full text-center border-2 border-blue-600 text-blue-600 py-2.5 rounded-lg text-[13px] font-semibold mt-3 hover:bg-blue-50 transition-all">Login</a>
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
                    © 2026 Blujay Technologies. All rights reserved.
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

    // Setup dashboard links dynamically
    setupDashboardLinks();
}

// Setup dashboard links based on user profile
async function setupDashboardLinks() {
    try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;

        const API_URL = window.API_CONFIG?.getApiUrl() || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/community/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const profile = data.profile;
            
            if (profile) {
                const dashboardUrl = profile.profileType === 'GIVER' ? 'giver-dashboard.html' : 'receiver-dashboard.html';
                
                const myDashboardLink = document.getElementById('myDashboardLink');
                const myDashboardLinkMobile = document.getElementById('myDashboardLinkMobile');
                
                if (myDashboardLink) {
                    myDashboardLink.href = dashboardUrl;
                }
                
                if (myDashboardLinkMobile) {
                    myDashboardLinkMobile.href = dashboardUrl;
                }
            }
        }
    } catch (error) {
        console.log('Dashboard link setup:', error);
    }
}
