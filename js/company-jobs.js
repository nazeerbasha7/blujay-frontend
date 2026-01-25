/**
 * Job Portal - Company Jobs Page
 * Displays all jobs for a specific company
 */

// State management
const state = {
    companySlug: '',
    currentPage: 1,
    companyData: null,
    jobsData: null
};

// API Endpoint
const API = {
    companyJobs: (slug) => `${API_BASE_URL}/api/jobs/company/${slug}`
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Get company slug from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const companySlug = urlParams.get('company');
    
    if (!companySlug) {
        showError();
        return;
    }
    
    state.companySlug = companySlug;
    
    // Load jobs for company
    loadCompanyJobs(1);
}

// ===========================
// LOAD COMPANY JOBS
// ===========================

async function loadCompanyJobs(page = 1) {
    state.currentPage = page;
    
    // Show loading state
    showLoading();
    
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 20
        });
        
        const response = await fetch(`${API.companyJobs(state.companySlug)}?${params}`);
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            if (response.status === 404) {
                showError();
            } else {
                showError();
            }
            return;
        }
        
        // Store company data
        if (result.meta.company) {
            state.companyData = result.meta.company;
            renderCompanyHeader(result.meta.company);
        }
        
        // Render jobs
        state.jobsData = result;
        renderJobs(result.data, result.meta.pagination);
        
    } catch (error) {
        console.error('Error loading company jobs:', error);
        showError();
    }
}

// ===========================
// RENDER COMPANY HEADER
// ===========================

function renderCompanyHeader(company) {
    const loadingHeader = document.getElementById('company-header-loading');
    const headerContainer = document.getElementById('company-header');
    const logoContainer = document.getElementById('company-logo-container');
    const logoPlaceholder = document.getElementById('company-logo-placeholder');
    
    loadingHeader.classList.add('hidden');
    headerContainer.classList.remove('hidden');
    
    // Update page title and meta
    document.title = `${company.name} Jobs | Blujay Technologies`;
    document.getElementById('page-title').textContent = `${company.name} Jobs | Blujay Technologies`;
    document.getElementById('page-description').setAttribute('content', `Browse ${company.totalJobs} job openings at ${company.name}. Apply directly and start your career journey.`);
    
    // Update company name
    document.getElementById('company-name').textContent = company.name;
    
    // Update job count
    const jobCountElement = document.getElementById('company-job-count');
    jobCountElement.innerHTML = `
        <i class="fas fa-briefcase mr-2 text-blujay"></i>
        <span class="font-semibold">${company.totalJobs}</span> Open ${company.totalJobs === 1 ? 'Position' : 'Positions'}
    `;
    
    // Update company logo
    if (company.logo) {
        logoContainer.innerHTML = `
            <img src="${escapeHtml(company.logo)}" alt="${escapeHtml(company.name)}" class="max-w-full max-h-full object-contain" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'w-12 h-12 bg-blujay rounded-lg flex items-center justify-center text-white text-2xl font-bold\\'>${escapeHtml(company.name.charAt(0))}</div>'">
        `;
    } else {
        logoPlaceholder.textContent = company.name.charAt(0).toUpperCase();
    }
}

// ===========================
// RENDER JOBS
// ===========================

function renderJobs(jobs, pagination) {
    const loadingContainer = document.getElementById('jobs-loading');
    const gridContainer = document.getElementById('jobs-grid');
    const emptyContainer = document.getElementById('jobs-empty');
    const errorContainer = document.getElementById('jobs-error');
    const paginationContainer = document.getElementById('jobs-pagination');
    
    loadingContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
    
    // Update results count
    document.getElementById('results-count').textContent = `Showing ${jobs.length} of ${pagination.total} positions`;
    
    if (jobs.length === 0 && pagination.page === 1) {
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
        paginationContainer.innerHTML = createPagination(pagination);
    } else {
        paginationContainer.classList.add('hidden');
    }
    
    // Scroll to top on page change
    if (pagination.page > 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===========================
// LOADING & ERROR STATES
// ===========================

function showLoading() {
    document.getElementById('company-header-loading').classList.remove('hidden');
    document.getElementById('company-header').classList.add('hidden');
    
    document.getElementById('jobs-grid').classList.add('hidden');
    document.getElementById('jobs-empty').classList.add('hidden');
    document.getElementById('jobs-error').classList.add('hidden');
    document.getElementById('jobs-pagination').classList.add('hidden');
    
    const loadingContainer = document.getElementById('jobs-loading');
    loadingContainer.classList.remove('hidden');
    loadingContainer.innerHTML = Array(6).fill(0).map(() => createJobSkeleton()).join('');
}

function showError() {
    document.getElementById('company-header-loading').classList.add('hidden');
    document.getElementById('company-header').classList.add('hidden');
    document.getElementById('jobs-loading').classList.add('hidden');
    document.getElementById('jobs-grid').classList.add('hidden');
    document.getElementById('jobs-empty').classList.add('hidden');
    document.getElementById('jobs-pagination').classList.add('hidden');
    document.getElementById('jobs-error').classList.remove('hidden');
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
                    <h3 class="text-xl font-bold text-gray-900 mb-2">
                        ${escapeHtml(job.title)}
                    </h3>
                    <div class="text-gray-600 font-medium">
                        ${escapeHtml(job.companyName)}
                    </div>
                </div>
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
                ${job.experienceLevel ? `
                    <span class="flex items-center">
                        <i class="fas fa-user-tie mr-2 text-blujay"></i>
                        ${escapeHtml(job.experienceLevel)}
                    </span>
                ` : ''}
            </div>
            
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                ${escapeHtml(stripHtml(job.description).substring(0, 200))}...
            </p>
            
            ${job.skills && job.skills.length > 0 ? `
                <div class="flex flex-wrap gap-2 mb-4">
                    ${job.skills.slice(0, 5).map(skill => `
                        <span class="badge badge-primary text-xs">${escapeHtml(skill)}</span>
                    `).join('')}
                    ${job.skills.length > 5 ? `<span class="text-xs text-gray-500">+${job.skills.length - 5} more</span>` : ''}
                </div>
            ` : ''}
            
            ${job.salaryMin && job.salaryMax ? `
                <div class="text-sm text-gray-600 mb-4">
                    <i class="fas fa-dollar-sign mr-2 text-blujay"></i>
                    <span class="font-semibold">${formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                </div>
            ` : ''}
            
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

function createJobSkeleton() {
    return `
        <div class="bg-white rounded-xl p-6 border">
            <div class="skeleton h-6 w-3/4 mb-4"></div>
            <div class="skeleton h-4 w-1/2 mb-4"></div>
            <div class="flex gap-2 mb-4">
                <div class="skeleton h-8 w-24"></div>
                <div class="skeleton h-8 w-24"></div>
            </div>
            <div class="skeleton h-20 w-full mb-4"></div>
            <div class="flex justify-between">
                <div class="skeleton h-8 w-20"></div>
                <div class="skeleton h-10 w-32"></div>
            </div>
        </div>
    `;
}

function createPagination(pagination) {
    const { page, pages, hasPrev, hasNext } = pagination;
    
    let html = '';
    
    // Previous button
    html += `
        <button 
            class="px-4 py-2 rounded-lg border ${hasPrev ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'}"
            ${!hasPrev ? 'disabled' : ''}
            onclick="loadCompanyJobs(${page - 1})"
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
                onclick="loadCompanyJobs(${i})"
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
            onclick="loadCompanyJobs(${page + 1})"
        >
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    return html;
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function formatSalary(min, max, currency = 'USD') {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    });
    
    if (min && max) {
        return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    
    return formatter.format(min || max);
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

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
