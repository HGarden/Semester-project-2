import { login } from '../api/auth/login/login.js';
import { validateLoginForm } from '../validation/auth.js';

function createLoginPage() {
  const loginForm = document.createElement('form');
  loginForm.className = 'auth-form';
  loginForm.innerHTML = `
    <div class="form-group">
      <label for="email">
        Email Address
        <span class="required">*</span>
      </label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        required 
        placeholder="your.name@stud.noroff.no"
        title="Must be a valid @stud.noroff.no email address"
      >
      <div class="error-message" id="email-error"></div>
    </div>
    
    <div class="form-group">
      <label for="password">
        Password
        <span class="required">*</span>
      </label>
      <div class="password-input-container">
        <input 
          type="password" 
          id="password" 
          name="password" 
          required 
          placeholder="Enter your password"
          title="Enter your account password"
        >
        <button type="button" class="toggle-password" id="toggle-password" title="Show/hide password">
          <span class="password-icon">👁️</span>
        </button>
      </div>
      <div class="error-message" id="password-error"></div>
    </div>
    
    <button type="submit" class="btn-primary form-submit-btn" id="login-submit">
      <span class="btn-text">Login to Account</span>
      <span class="btn-loading hidden">
        <span class="loading-spinner"></span>
        Logging in...
      </span>
    </button>
    
    <div id="login-error" class="error-message general-error hidden"></div>
  `;

  // Add password toggle functionality
  const togglePassword = loginForm.querySelector('#toggle-password');
  const passwordInput = loginForm.querySelector('#password');
  const passwordIcon = loginForm.querySelector('.password-icon');
  
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    passwordIcon.textContent = type === 'password' ? '👁️' : '🙈';
  });

  loginForm.addEventListener('submit', handleLogin);
  return loginForm;
}

async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('#login-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const errorDiv = form.querySelector('#login-error');
  
  // Clear previous errors
  clearFormErrors(form);
  
  const loginData = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  const validation = validateLoginForm(loginData);

  if (!validation.isValid) {
    displayFormErrors(form, validation.errors.map(error => ({ field: 'general', message: error })));
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  btnText.classList.add('hidden');
  btnLoading.classList.remove('hidden');

  try {
    errorDiv.classList.add('hidden');
    const response = await login(loginData);
    
    // Redirect to home page on successful login
    window.location.href = '/';
  } catch (error) {
    showError(errorDiv, error.message);
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
  }
}

function clearFormErrors(form) {
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach(error => {
    error.textContent = '';
    error.classList.remove('show');
  });
  
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
}

function displayFormErrors(form, errors) {
  errors.forEach(error => {
    const errorElement = form.querySelector(`#${error.field}-error`);
    const inputElement = form.querySelector(`#${error.field}`);
    
    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.classList.add('show');
    }
    
    if (inputElement) {
      inputElement.classList.add('error');
    }
  });
}

function showError(errorDiv, message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

export { createLoginPage };
