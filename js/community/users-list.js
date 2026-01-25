/**
 * USERS-LIST.JS
 * 
 * Handles listing of verified users (MASKED DATA)
 * 
 * FUNCTIONS:
 * - loadUsersList(targetRole) - Load list of users
 * - renderUserCard(user) - Render individual user card
 * - openConnectionModal(userId, userName) - Open connection request modal
 */

// API Base URL
const API_BASE = '';  // Empty means same origin

// Global variables
let currentUsersList = [];
let selectedUserId = null;
let selectedUserName = null;

/**
 * Load list of verified users
 * @param {string} targetRole - The role to search for (RECEIVER or GIVER)
 */
async function loadUsersList(targetRole) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const usersList = document.getElementById('usersList');
    const noUsersMessage = document.getElementById('noUsersMessage');
    
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    if (usersList) usersList.innerHTML = '';
    if (noUsersMessage) noUsersMessage.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/api/users/list`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUsersList = data.users || [];
            
            if (currentUsersList.length === 0) {
                if (noUsersMessage) noUsersMessage.classList.remove('hidden');
            } else {
                if (usersList) {
                    usersList.innerHTML = currentUsersList.map(user => renderUserCard(user)).join('');
                }
            }
        } else if (response.status === 403) {
            const data = await response.json();
            if (usersList) {
                usersList.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-red-600 font-semibold">${data.error}</p>
                        ${data.needsProfile ? '<a href="' + (targetRole === 'RECEIVER' ? 'receiver-profile.html' : 'giver-profile.html') + '" class="text-blue-600 underline">Complete your profile</a>' : ''}
                    </div>
                `;
            }
        } else {
            console.error('Error loading users:', response.statusText);
            if (noUsersMessage) noUsersMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        if (noUsersMessage) noUsersMessage.classList.remove('hidden');
    } finally {
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
}

/**
 * Render a user card
 */
function renderUserCard(user) {
    const statusBadges = {
        'NONE': '<button onclick="openConnectionModal(\'' + user.userId + '\', \'' + user.fullName + '\')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Connect</button>',
        'SENT': '<span class="bg-yellow-100 text-yellow-700 px-4 py-2 rounded">⏳ Request Sent</span>',
        'PENDING': '<span class="bg-yellow-100 text-yellow-700 px-4 py-2 rounded">⏳ Pending</span>',
        'RECEIVED': '<span class="bg-blue-100 text-blue-700 px-4 py-2 rounded">📩 Request Received</span>',
        'ACCEPTED': '<span class="bg-blue-100 text-blue-700 px-4 py-2 rounded">✓ Accepted (Admin Review)</span>',
        'APPROVED': '<span class="bg-green-100 text-green-700 px-4 py-2 rounded">✓ Connected</span>',
        'REJECTED_BY_USER': '<span class="bg-red-100 text-red-700 px-4 py-2 rounded">✗ Rejected</span>',
        'REJECTED_BY_ADMIN': '<span class="bg-red-100 text-red-700 px-4 py-2 rounded">✗ Rejected by Admin</span>'
    };

    // Determine if this is a receiver or giver
    const isReceiver = user.currentRole !== undefined;
    
    return `
        <div class="user-card border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h4 class="text-xl font-bold text-gray-800">${user.fullName}</h4>
                    ${isReceiver ? `
                        <p class="text-gray-600">${user.currentRole}</p>
                        <p class="text-sm text-gray-500">${user.experienceYears} years exp • ${user.currentLocation}</p>
                    ` : `
                        <p class="text-gray-600">${user.designation} at ${user.companyName}</p>
                        <p class="text-sm text-gray-500">${user.location} • ${user.companySize} employees</p>
                    `}
                </div>
                <div>
                    ${statusBadges[user.connectionStatus] || statusBadges['NONE']}
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-sm font-semibold text-gray-700">
                    ${isReceiver ? 'Skills:' : 'Hiring For:'}
                </p>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${isReceiver 
                        ? `<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">${user.primarySkill}</span>`
                        : `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">${user.primaryHiringSkill}</span>`
                    }
                    ${isReceiver && user.skills 
                        ? user.skills.slice(0, 3).map(skill => `<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">${skill}</span>`).join('')
                        : !isReceiver && user.hiringFor
                        ? user.hiringFor.slice(0, 3).map(skill => `<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">${skill}</span>`).join('')
                        : ''
                    }
                </div>
            </div>
            
            ${user.bio ? `
                <div class="mb-4">
                    <p class="text-sm text-gray-600 italic">"${user.bio.substring(0, 150)}${user.bio.length > 150 ? '...' : ''}"</p>
                </div>
            ` : ''}
            
            <div class="flex gap-4 text-sm text-gray-500">
                ${user.linkedinProfile ? `<a href="${user.linkedinProfile}" target="_blank" class="text-blue-600 hover:underline">🔗 LinkedIn</a>` : ''}
                ${user.portfolioUrl ? `<a href="${user.portfolioUrl}" target="_blank" class="text-blue-600 hover:underline">🌐 Portfolio</a>` : ''}
                ${isReceiver && user.noticePeriod ? `<span>📅 ${user.noticePeriod}</span>` : ''}
                ${!isReceiver && user.experienceRangeNeeded ? `<span>📊 ${user.experienceRangeNeeded.min}-${user.experienceRangeNeeded.max} years</span>` : ''}
            </div>
        </div>
    `;
}

/**
 * Open connection request modal
 */
function openConnectionModal(userId, userName) {
    selectedUserId = userId;
    selectedUserName = userName;
    
    const modal = document.getElementById('requestModal');
    const modalUserName = document.getElementById('modalUserName');
    const requestMessage = document.getElementById('requestMessage');
    
    if (modal) {
        modal.classList.remove('hidden');
        if (modalUserName) modalUserName.textContent = userName;
        if (requestMessage) requestMessage.value = '';
        
        // Setup modal buttons
        setupModalButtons();
    }
}

/**
 * Setup modal button event listeners
 */
function setupModalButtons() {
    const sendBtn = document.getElementById('sendRequestBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    
    if (sendBtn) {
        sendBtn.onclick = async () => {
            await sendConnectionRequest();
        };
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            closeConnectionModal();
        };
    }
}

/**
 * Close connection request modal
 */
function closeConnectionModal() {
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    selectedUserId = null;
    selectedUserName = null;
}

/**
 * Send connection request
 */
async function sendConnectionRequest() {
    if (!selectedUserId) {
        alert('No user selected');
        return;
    }
    
    const messageInput = document.getElementById('requestMessage');
    const message = messageInput ? messageInput.value.trim() : '';
    
    const sendBtn = document.getElementById('sendRequestBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/community/connection/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                targetUserId: selectedUserId,
                message: message
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Connection request sent successfully!');
            closeConnectionModal();
            
            // Reload users list to update status
            const role = window.location.pathname.includes('receiver') ? 'GIVER' : 'RECEIVER';
            await loadUsersList(role);
        } else {
            alert(data.error || 'Failed to send connection request');
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send Request';
            }
        }
    } catch (error) {
        console.error('Error sending connection request:', error);
        alert('An error occurred. Please try again.');
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Request';
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('requestModal');
    if (modal && e.target === modal) {
        closeConnectionModal();
    }
});
