/**
 * Job Portal - Main Jobs Page
 * Handles All Jobs and Companies view with pagination
 */

// State management
const state = {
    currentView: 'jobs', // 'jobs' or 'companies'
    currentPage: 1,
    filters: {
        employmentType: '',
        isRemote: '',
        search: ''
    },
    jobsData: null,
    companiesData: null
};

// API Endpoints
const API = {
    jobs: `${API_BASE_URL}/api/jobs`,
    companies: `${API_BASE_URL}/api/jobs/companies`,
    search: `${API_BASE_URL}/api/jobs/search`,
    stats: `${API_BASE_URL}/api/jobs/stats/overview`
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load statistics
    loadStatistics();
    
    // Load jobs by default
    loadJobs(1);
    
    // Setup event listeners
    setupEventListeners();
}

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
    // Toggle between All Jobs and Companies
    document.getElementById('toggle-all-jobs').addEventListener('click', () => {
        switchView('jobs');
    });
    
    document.getElementById('toggle-companies').addEventListener('click', () => {
        switchView('companies');
    });
    
    // Search
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Desktop filters
    document.getElementById('filter-type').addEventListener('change', (e) => {
        state.filters.employmentType = e.target.value;
        loadJobs(1);
    });
    
    document.getElementById('filter-remote').addEventListener('change', (e) => {
        state.filters.isRemote = e.target.value;
        loadJobs(1);
    });
    
    // Mobile filters
    document.getElementById('apply-filters-mobile').addEventListener('click', () => {
        state.filters.employmentType = document.getElementById('filter-type-mobile').value;
        state.filters.isRemote = document.getElementById('filter-remote-mobile').value;
        loadJobs(1);
        document.getElementById('close-filter-modal').click();
    });
    
    // Clear filters
    document.getElementById('clear-filters-btn').addEventListener('click', () => {
        clearFilters();
        loadJobs(1);
    });
}

function clearFilters() {
    state.filters = {
        employmentType: '',
        isRemote: '',
        search: ''
    };
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-remote').value = '';
    document.getElementById('filter-type-mobile').value = '';
    document.getElementById('filter-remote-mobile').value = '';
    document.getElementById('search-input').value = '';
}

// ===========================
// VIEW SWITCHING
// ===========================

function switchView(view) {
    state.currentView = view;
    state.currentPage = 1;
    
    // Update toggle buttons
    const jobsBtn = document.getElementById('toggle-all-jobs');
    const companiesBtn = document.getElementById('toggle-companies');
    
    if (view === 'jobs') {
        jobsBtn.classList.add('active');
        companiesBtn.classList.remove('active');
        document.getElementById('all-jobs-view').classList.remove('hidden');
        document.getElementById('companies-view').classList.add('hidden');
        loadJobs(1);
    } else {
        companiesBtn.classList.add('active');
        jobsBtn.classList.remove('active');
        document.getElementById('companies-view').classList.remove('hidden');
        document.getElementById('all-jobs-view').classList.add('hidden');
        loadCompanies(1);
    }
}

// ===========================
// LOAD STATISTICS
// ===========================

async function loadStatistics() {
    try {
        const response = await fetch(API.stats);
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('stats-jobs').textContent = formatNumber(stats.totalActiveJobs);
            document.getElementById('stats-companies').textContent = formatNumber(stats.totalCompanies);
            document.getElementById('stats-locations').textContent = formatNumber(stats.totalLocations);
            document.getElementById('stats-recent').textContent = formatNumber(stats.recentJobs);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Set default values on error
        document.getElementById('stats-jobs').textContent = '-';
        document.getElementById('stats-companies').textContent = '-';
        document.getElementById('stats-locations').textContent = '-';
        document.getElementById('stats-recent').textContent = '-';
    }
}

// ===========================
// LOAD JOBS
// ===========================

async function loadJobs(page = 1) {
    state.currentPage = page;
    
    // Show loading state
    showJobsLoading();
    
    try {
        // Build query parameters
        const params = new URLSearchParams({
            page: page,
            limit: 20
        });
        
        if (state.filters.employmentType) {
            params.append('employmentType', state.filters.employmentType);
        }
        
        if (state.filters.isRemote) {
            params.append('isRemote', state.filters.isRemote);
        }
        
        const response = await fetch(`${API.jobs}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            state.jobsData = result;
            renderJobs(result.data, result.meta.pagination);
        } else {
            showJobsError();
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        showJobsError();
    }
}

function showJobsLoading() {
    document.getElementById('jobs-grid').classList.add('hidden');
    document.getElementById('jobs-empty').classList.add('hidden');
    document.getElementById('jobs-pagination').classList.add('hidden');
    
    const loadingContainer = document.getElementById('jobs-loading');
    loadingContainer.classList.remove('hidden');
    loadingContainer.innerHTML = Array(6).fill(0).map(() => createJobSkeleton()).join('');
}

function renderJobs(jobs, pagination) {
    const loadingContainer = document.getElementById('jobs-loading');
    const gridContainer = document.getElementById('jobs-grid');
    const emptyContainer = document.getElementById('jobs-empty');
    const paginationContainer = document.getElementById('jobs-pagination');
    
    loadingContainer.classList.add('hidden');
    
    // Update results count
    document.getElementById('results-count').textContent = `Showing ${jobs.length} of ${pagination.total} jobs`;
    document.getElementById('results-count-mobile').textContent = `${pagination.total} jobs`;
    
    if (jobs.length === 0) {
        gridContainer.classList.add('hidden');
        paginationContainer.classList.add('hidden');
        emptyContainer.classList.remove('hidden');
        return;
    }
    
    emptyContainer.classList.add('hidden');
    gridContainer.classList.remove('hidden');
    gridContainer.innerHTML = jobs.map(job => createJobCard(job)).join('');
    
    // Render pagination
    if (pagination.pages > 1) {
        paginationContainer.classList.remove('hidden');
        paginationContainer.innerHTML = createPagination(pagination, loadJobs);
    } else {
        paginationContainer.classList.add('hidden');
    }
}

function showJobsError() {
    document.getElementById('jobs-loading').classList.add('hidden');
    document.getElementById('jobs-grid').classList.add('hidden');
    document.getElementById('jobs-pagination').classList.add('hidden');
    document.getElementById('jobs-empty').classList.remove('hidden');
}

// ===========================
// LOAD COMPANIES
// ===========================

async function loadCompanies(page = 1) {
    state.currentPage = page;
    
    // Show loading state
    showCompaniesLoading();
    
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 21
        });
        
        const response = await fetch(`${API.companies}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            state.companiesData = result;
            renderCompanies(result.data, result.meta.pagination);
        } else {
            showCompaniesError();
        }
    } catch (error) {
        console.error('Error loading companies:', error);
        showCompaniesError();
    }
}

function showCompaniesLoading() {
    document.getElementById('companies-grid').classList.add('hidden');
    document.getElementById('companies-empty').classList.add('hidden');
    document.getElementById('companies-pagination').classList.add('hidden');
    
    const loadingContainer = document.getElementById('companies-loading');
    loadingContainer.classList.remove('hidden');
    loadingContainer.innerHTML = Array(9).fill(0).map(() => createCompanySkeleton()).join('');
}

function renderCompanies(companies, pagination) {
    const loadingContainer = document.getElementById('companies-loading');
    const gridContainer = document.getElementById('companies-grid');
    const emptyContainer = document.getElementById('companies-empty');
    const paginationContainer = document.getElementById('companies-pagination');
    
    loadingContainer.classList.add('hidden');
    
    if (companies.length === 0) {
        gridContainer.classList.add('hidden');
        paginationContainer.classList.add('hidden');
        emptyContainer.classList.remove('hidden');
        return;
    }
    
    emptyContainer.classList.add('hidden');
    gridContainer.classList.remove('hidden');
    gridContainer.innerHTML = companies.map(company => createCompanyCard(company)).join('');
    
    // Render pagination
    if (pagination.pages > 1) {
        paginationContainer.classList.remove('hidden');
        paginationContainer.innerHTML = createPagination(pagination, loadCompanies);
    } else {
        paginationContainer.classList.add('hidden');
    }
}

function showCompaniesError() {
    document.getElementById('companies-loading').classList.add('hidden');
    document.getElementById('companies-grid').classList.add('hidden');
    document.getElementById('companies-pagination').classList.add('hidden');
    document.getElementById('companies-empty').classList.remove('hidden');
}

// ===========================
// SEARCH
// ===========================

async function handleSearch() {
    const query = document.getElementById('search-input').value.trim();
    
    if (!query) {
        loadJobs(1);
        return;
    }
    
    state.filters.search = query;
    showJobsLoading();
    
    try {
        const params = new URLSearchParams({
            q: query,
            page: 1,
            limit: 20
        });
        
        const response = await fetch(`${API.search}?${params}`);
        const result = await response.json();
        
        if (result.success) {
            renderJobs(result.data, result.meta.pagination);
        } else {
            showJobsError();
        }
    } catch (error) {
        console.error('Error searching jobs:', error);
        showJobsError();
    }
}

// ===========================
// UI COMPONENTS
// ===========================

function createJobCard(job) {
    const daysAgo = calculateDaysAgo(job.postedAt);
    const isNew = daysAgo <= 7;
    
    return `
        <div class="job-card bg-white rounded-xl p-6 fade-in">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-2 hover:text-blujay transition cursor-pointer">
                        ${escapeHtml(job.title)}
                    </h3>
                    <a href="company-jobs.html?company=${encodeURIComponent(job.companySlug)}" class="text-gray-600 hover:text-blujay transition font-medium">
                        ${escapeHtml(job.companyName)}
                    </a>
                </div>
                ${job.companyLogo ? `
                    <img src="${escapeHtml(job.companyLogo)}" alt="${escapeHtml(job.companyName)}" class="w-12 h-12 rounded-lg object-contain bg-gray-50 border" onerror="this.style.display='none'">
                ` : ''}
            </div>
            
            <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                <span class="flex items-center">
                    <i class="fas fa-map-marker-alt mr-2 text-blujay"></i>
                    ${escapeHtml(job.location)}
                </span>
                ${job.employmentType ? `
                    <span class="flex items-center">
                        <i class="fas fa-clock mr-2 text-blujay"></i>
                        ${escapeHtml(job.employmentType)}
                    </span>
                ` : ''}
                ${job.isRemote ? `
                    <span class="badge badge-success">
                        <i class="fas fa-home mr-1"></i>
                        Remote
                    </span>
                ` : ''}
            </div>
            
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                ${escapeHtml(job.description.substring(0, 150))}...
            </p>
            
            <div class="flex justify-between items-center pt-4 border-t">
                <div class="flex items-center space-x-2">
                    ${isNew ? '<span class="badge badge-primary">New</span>' : ''}
                    <span class="text-sm text-gray-500">${formatTimeAgo(daysAgo)}</span>
                </div>
                <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="bg-blujay text-white px-6 py-2 rounded-lg hover:bg-blujay-hover transition font-medium">
                    Apply Now
                </a>
            </div>
        </div>
    `;
}

function createCompanyCard(company) {
    return `
        <a href="company-jobs.html?company=${encodeURIComponent(company.companySlug)}" class="company-card bg-white rounded-xl p-6 cursor-pointer fade-in block">
            <div class="flex items-center gap-4 mb-4">
                ${company.companyLogo ? `
                    <img src="${escapeHtml(company.companyLogo)}" alt="${escapeHtml(company.companyName)}" class="w-16 h-16 rounded-lg object-contain bg-gray-50 border" onerror="this.style.display='none'">
                ` : `
                    <div class="w-16 h-16 rounded-lg bg-blujay-light flex items-center justify-center text-blujay text-2xl font-bold">
                        ${escapeHtml(company.companyName.charAt(0))}
                    </div>
                `}
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 mb-1">${escapeHtml(company.companyName)}</h3>
                    <span class="text-blujay font-semibold">${company.jobCount} ${company.jobCount === 1 ? 'Job' : 'Jobs'}</span>
                </div>
            </div>
            <div class="text-sm text-gray-500">
                <i class="fas fa-clock mr-2"></i>
                Latest: ${formatDate(company.latestJobDate)}
            </div>
        </a>
    `;
}

function createJobSkeleton() {
    return `
        <div class="bg-white rounded-xl p-6 border">
            <div class="skeleton h-6 w-3/4 mb-4"></div>
            <div class="skeleton h-4 w-1/2 mb-4"></div>
            <div class="flex gap-2 mb-4">
                <div class="skeleton h-8 w-24"></div>
                <div class="skeleton h-8 w-24"></div>
            </div>
            <div class="skeleton h-16 w-full mb-4"></div>
            <div class="flex justify-between">
                <div class="skeleton h-8 w-20"></div>
                <div class="skeleton h-10 w-32"></div>
            </div>
        </div>
    `;
}

function createCompanySkeleton() {
    return `
        <div class="bg-white rounded-xl p-6 border">
            <div class="flex items-center gap-4 mb-4">
                <div class="skeleton w-16 h-16 rounded-lg"></div>
                <div class="flex-1">
                    <div class="skeleton h-6 w-3/4 mb-2"></div>
                    <div class="skeleton h-4 w-1/2"></div>
                </div>
            </div>
            <div class="skeleton h-4 w-2/3"></div>
        </div>
    `;
}

function createPagination(pagination, loadFunction) {
    const { page, pages, hasPrev, hasNext } = pagination;
    
    let html = '';
    
    // Previous button
    html += `
        <button 
            class="px-4 py-2 rounded-lg border ${hasPrev ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'}"
            ${!hasPrev ? 'disabled' : ''}
            onclick="${loadFunction.name}(${page - 1})"
        >
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button 
                class="pagination-btn px-4 py-2 rounded-lg border ${i === page ? 'active' : 'hover:bg-gray-100 text-gray-700'}"
                onclick="${loadFunction.name}(${i})"
            >
                ${i}
            </button>
        `;
    }
    
    // Next button
    html += `
        <button 
            class="px-4 py-2 rounded-lg border ${hasNext ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'}"
            ${!hasNext ? 'disabled' : ''}
            onclick="${loadFunction.name}(${page + 1})"
        >
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    return html;
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function calculateDaysAgo(dateString) {
    const posted = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - posted);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatTimeAgo(days) {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
