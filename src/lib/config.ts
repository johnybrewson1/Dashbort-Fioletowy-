// API Configuration
export const API_CONFIG = {
  // Backend URL - zmień na ngrok URL dla lokalnego testowania
  // lub na produkcyjny URL dla wdrożenia
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  
  // Endpoints
  ENDPOINTS: {
    GENERATE: '/api/generate',
    REGENERATE_POST: '/api/regenerate-post',
    REGENERATE_IMAGE: '/api/regenerate-image',
    REGENERATE_ALL: '/api/regenerate-all',
    PUBLISH: '/api/publish',
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

