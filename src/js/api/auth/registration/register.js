import { post } from '../../post.js';

async function register(userData) {
  try {
    // Send registration request without credits first (API may not accept it)
    const response = await post('auth/register', userData);
    
    // Store user info in localStorage after successful registration
    if (response.data) {
      localStorage.setItem('user_name', response.data.name);
      localStorage.setItem('user_email', response.data.email);
      // Set initial credits bonus - API should provide this, but ensure it's at least 1000
      const credits = response.data.credits || 1000;
      localStorage.setItem('user_credits', credits.toString());
    }
    
    return response;
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

export { register };
