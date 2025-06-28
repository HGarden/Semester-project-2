import { post } from '../../post.js';

async function login(credentials) {
  try {
    const response = await post('auth/login', credentials);
    
    // Store the access token in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('user_name', response.data.name);
      localStorage.setItem('user_email', response.data.email);
      localStorage.setItem('user_credits', response.data.credits);
    }
    
    return response;
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_credits');
  
  // Redirect to home page
  window.location.href = '/';
}

export { login, logout };
