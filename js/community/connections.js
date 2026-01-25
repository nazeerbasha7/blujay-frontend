/**
 * CONNECTIONS.JS
 * 
 * Handles connection requests and status management
 * 
 * FUNCTIONS:
 * - loadMyConnections() - Load all connections
 * - acceptConnectionRequest(requestId) - Accept a connection request
 * - rejectConnectionRequest(requestId) - Reject a connection request
 * - loadApprovedConnections() - Load connections with revealed contacts
 */

// API Base URL
const API_BASE = '';  // Empty means same origin

/**
 * Load all connections for current user
 */
async function loadMyConnections() {
    try {
        const response = await fetch(`${API_BASE}/api/community/connections`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.connections || [];
        } else {
            console.error('Error loading connections:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error loading connections:', error);
        return [];
    }
}

/**
 * Load approved connections with revealed contact details
 */
async function loadApprovedConnections() {
    try {
        const response = await fetch(`${API_BASE}/api/community/connections`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Filter for ADMIN_APPROVED connections with revealed mobile numbers
            const approvedConnections = data.connections.filter(c => 
                c.status === 'ADMIN_APPROVED' && c.mobileNumbersRevealed
            );
            return approvedConnections || [];
        } else {
            console.error('Error loading approved connections:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error loading approved connections:', error);
        return [];
    }
}

/**
 * Accept a connection request
 */
async function acceptConnectionRequest(requestId) {
    if (!confirm('Accept this connection request?')) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/api/community/connection/${requestId}/respond`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'accept',
                note: 'Accepted'
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Connection request accepted! Waiting for admin approval.');
            return true;
        } else {
            alert(data.error || 'Failed to accept connection request');
            return false;
        }
    } catch (error) {
        console.error('Error accepting connection request:', error);
        alert('An error occurred. Please try again.');
        return false;
    }
}

/**
 * Reject a connection request
 */
async function rejectConnectionRequest(requestId) {
    if (!confirm('Reject this connection request?')) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/api/connections/${requestId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'reject',
                note: 'Rejected'
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Connection request rejected.');
            return true;
        } else {
            alert(data.error || 'Failed to reject connection request');
            return false;
        }
    } catch (error) {
        console.error('Error rejecting connection request:', error);
        alert('An error occurred. Please try again.');
        return false;
    }
}

/**
 * Get connection status badge HTML
 */
function getConnectionStatusBadge(status) {
    const badges = {
        'REQUESTED': '<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">⏳ Pending Response</span>',
        'USER_ACCEPTED': '<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">✓ Accepted - Admin Review</span>',
        'ADMIN_APPROVED': '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">✓ Approved - Contact Revealed</span>',
        'USER_REJECTED': '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">✗ Rejected</span>',
        'ADMIN_REJECTED': '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">✗ Rejected by Admin</span>'
    };

    return badges[status] || '<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">' + status + '</span>';
}

/**
 * Render connection card
 */
function renderConnectionCard(connection) {
    const typeLabel = connection.type === 'SENT' ? '📤 Sent' : '📥 Received';
    const dateStr = new Date(connection.createdAt).toLocaleDateString();

    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="text-lg font-bold text-gray-800">${connection.otherUser.fullName}</h4>
                    <p class="text-sm text-gray-600">${connection.otherUser.currentRole || connection.otherUser.companyName || ''}</p>
                    <p class="text-xs text-gray-500">${connection.otherUser.primarySkill || ''}</p>
                </div>
                <div class="text-right">
                    ${getConnectionStatusBadge(connection.status)}
                    <p class="text-xs text-gray-400 mt-1">${typeLabel} • ${dateStr}</p>
                </div>
            </div>

            ${connection.message ? `
                <div class="bg-gray-50 rounded p-3 mb-3">
                    <p class="text-sm text-gray-600 italic">"${connection.message}"</p>
                </div>
            ` : ''}

            ${connection.type === 'RECEIVED' && connection.status === 'REQUESTED' ? `
                <div class="flex gap-2 mt-3">
                    <button 
                        onclick="handleAcceptRequest('${connection._id}')" 
                        class="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm font-semibold">
                        Accept
                    </button>
                    <button 
                        onclick="handleRejectRequest('${connection._id}')" 
                        class="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm font-semibold">
                        Reject
                    </button>
                </div>
            ` : ''}

            ${connection.status === 'ADMIN_APPROVED' && connection.mobileNumbersRevealed ? `
                <div class="bg-green-50 border border-green-300 rounded p-3 mt-3">
                    <p class="text-xs font-semibold text-green-700 mb-1">🔓 Contact Details Revealed</p>
                    <p class="text-sm text-gray-700">Check the "Approved" tab for full contact information.</p>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Handle accept request (with page reload)
 */
async function handleAcceptRequest(requestId) {
    const success = await acceptConnectionRequest(requestId);
    if (success) {
        // Reload the page or refresh connections
        window.location.reload();
    }
}

/**
 * Handle reject request (with page reload)
 */
async function handleRejectRequest(requestId) {
    const success = await rejectConnectionRequest(requestId);
    if (success) {
        // Reload the page or refresh connections
        window.location.reload();
    }
}
