const apiUrl = 'https://v2.api.noroff.dev/';
const registerUrl = `${apiUrl}auth/register`;
const loginUrl = `${apiUrl}auth/login`;
const createApiKeyUrl = `${apiUrl}auth/create-api-key`;

export {
  apiUrl,   // Base URL for the API  
    registerUrl, // URL for user registration
    loginUrl, // URL for user login
    createApiKeyUrl // URL for creating an API key
};
// This module exports constants for API URLs used in the application.