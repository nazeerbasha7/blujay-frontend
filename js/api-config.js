// API Configuration
// This file manages API endpoints for development and production environments

const API_CONFIG = {
    // Development: Local backend server
    development: 'http://127.0.0.1:5000/api',
    
    // Production: Deployed backend server
    // IMPORTANT: Update this URL after deploying your backend to Render/Vercel
    production: 'https://blujay-backend.onrender.com/api',
    
    // Automatically detect environment
    getApiUrl: function() {
        // LOCAL TESTING MODE - Using localhost for testing
        return this.development;
        
        // PRODUCTION MODE - Uncomment line below and comment above for production
        // return this.production;
    }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;

console.log('🌐 Environment:', window.location.hostname);
console.log('🔧 API URL:', API_CONFIG.getApiUrl());
