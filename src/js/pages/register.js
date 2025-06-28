import { register } from '../api/auth/registration/register.js';
import { validateRegistrationForm } from '../validation/auth.js';

function createRegistrationPage() {
  const registerForm = document.createElement('form');
  registerForm.className = 'auth-form';
  registerForm.innerHTML = `
    <!-- Required Fields Section -->
    <div class="form-section">
      <h3 class="form-section-title">Account Information</h3>
      <div class="bonus-info">
        <p><strong>Welcome Bonus:</strong> New users receive 1000 credits to start bidding!</p>
      </div>
      
      <div class="form-group">
        <label for="name">
          Username
          <span class="required">*</span>
        </label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          placeholder="Enter your username"
          title="Choose a unique username for your account"
        >
        <div class="error-message" id="name-error"></div>
      </div>
      
      <div class="form-group">
        <label for="email">
          Email Address
          <span class="required">*</span>
          <span class="tooltip" title="Must be a valid @stud.noroff.no email address">ⓘ</span>
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
          <span class="tooltip" title="Minimum 8 characters required">ⓘ</span>
        </label>
        <div class="password-input-container">
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            placeholder="Enter your password"
            title="Minimum 8 characters required"
          >
          <button type="button" class="toggle-password" id="toggle-password" title="Show/hide password">
            <span class="password-icon">👁️</span>
          </button>
        </div>
        <div class="error-message" id="password-error"></div>
      </div>
    </div>

    <!-- Optional Profile Section -->
    <div class="form-section">
      <h3 class="form-section-title">Profile Information <span class="optional-badge">Optional</span></h3>
      
      <div class="form-group">
        <label for="bio">
          Bio
          <span class="tooltip" title="Tell others about yourself (max 160 characters)">ⓘ</span>
        </label>
        <textarea 
          id="bio" 
          name="bio" 
          rows="3"
          maxlength="160"
          placeholder="Tell us about yourself..."
          title="Tell others about yourself (max 160 characters)"
        ></textarea>
        <div class="char-count">
          <span id="bio-count">0</span>/160 characters
        </div>
        <div class="error-message" id="bio-error"></div>
      </div>
    </div>

    <!-- Media Section -->
    <div class="form-section collapsible">
      <button type="button" class="form-section-toggle" id="media-toggle">
        <h3 class="form-section-title">Avatar & Banner <span class="optional-badge">Optional</span></h3>
        <span class="toggle-icon">▼</span>
      </button>
      
      <div class="form-section-content" id="media-content">
        <div class="form-group">
          <label for="avatarUrl">
            Avatar Image URL
            <span class="tooltip" title="URL to your profile picture">ⓘ</span>
          </label>
          <input 
            type="url" 
            id="avatarUrl" 
            name="avatarUrl" 
            placeholder="https://example.com/avatar.jpg"
            title="URL to your profile picture"
          >
          <div class="error-message" id="avatarUrl-error"></div>
        </div>
        
        <div class="form-group">
          <label for="avatarAlt">
            Avatar Description
            <span class="tooltip" title="Describe your avatar image (max 120 characters)">ⓘ</span>
          </label>
          <input 
            type="text" 
            id="avatarAlt" 
            name="avatarAlt" 
            maxlength="120"
            placeholder="Description of your avatar"
            title="Describe your avatar image (max 120 characters)"
          >
          <div class="char-count">
            <span id="avatarAlt-count">0</span>/120 characters
          </div>
          <div class="error-message" id="avatarAlt-error"></div>
        </div>
        
        <div class="form-group">
          <label for="bannerUrl">
            Banner Image URL
            <span class="tooltip" title="URL to your profile banner image">ⓘ</span>
          </label>
          <input 
            type="url" 
            id="bannerUrl" 
            name="bannerUrl" 
            placeholder="https://example.com/banner.jpg"
            title="URL to your profile banner image"
          >
          <div class="error-message" id="bannerUrl-error"></div>
        </div>
        
        <div class="form-group">
          <label for="bannerAlt">
            Banner Description
            <span class="tooltip" title="Describe your banner image (max 120 characters)">ⓘ</span>
          </label>
          <input 
            type="text" 
            id="bannerAlt" 
            name="bannerAlt" 
            maxlength="120"
            placeholder="Description of your banner"
            title="Describe your banner image (max 120 characters)"
          >
          <div class="char-count">
            <span id="bannerAlt-count">0</span>/120 characters
          </div>
          <div class="error-message" id="bannerAlt-error"></div>
        </div>
      </div>
    </div>
    
    <button type="submit" class="btn-primary form-submit-btn" id="register-submit">
      <span class="btn-text">Create Account</span>
      <span class="btn-loading hidden">
        <span class="loading-spinner"></span>
        Creating account...
      </span>
    </button>
    
    <div id="register-error" class="error-message general-error hidden"></div>
  `;

  // Add interactive functionality
  setupFormInteractions(registerForm);
  registerForm.addEventListener('submit', handleRegistration);
  return registerForm;
}

function setupFormInteractions(form) {
  // Password toggle functionality
  const togglePassword = form.querySelector('#toggle-password');
  const passwordInput = form.querySelector('#password');
  const passwordIcon = form.querySelector('.password-icon');
  
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    passwordIcon.textContent = type === 'password' ? '👁️' : '🙈';
  });

  // Character count for textareas
  const bioTextarea = form.querySelector('#bio');
  const bioCount = form.querySelector('#bio-count');
  const avatarAltInput = form.querySelector('#avatarAlt');
  const avatarAltCount = form.querySelector('#avatarAlt-count');
  const bannerAltInput = form.querySelector('#bannerAlt');
  const bannerAltCount = form.querySelector('#bannerAlt-count');
  
  if (bioTextarea && bioCount) {
    bioTextarea.addEventListener('input', () => {
      bioCount.textContent = bioTextarea.value.length;
    });
  }
  
  if (avatarAltInput && avatarAltCount) {
    avatarAltInput.addEventListener('input', () => {
      avatarAltCount.textContent = avatarAltInput.value.length;
    });
  }
  
  if (bannerAltInput && bannerAltCount) {
    bannerAltInput.addEventListener('input', () => {
      bannerAltCount.textContent = bannerAltInput.value.length;
    });
  }

  // Collapsible section toggle
  const mediaToggle = form.querySelector('#media-toggle');
  const mediaContent = form.querySelector('#media-content');
  const toggleIcon = form.querySelector('.toggle-icon');
  
  if (mediaToggle && mediaContent) {
    // Start collapsed
    mediaContent.style.maxHeight = '0';
    mediaContent.style.overflow = 'hidden';
    toggleIcon.textContent = '▶';
    
    mediaToggle.addEventListener('click', () => {
      const isExpanded = mediaContent.style.maxHeight !== '0px';
      
      if (isExpanded) {
        mediaContent.style.maxHeight = '0';
        toggleIcon.textContent = '▶';
      } else {
        mediaContent.style.maxHeight = mediaContent.scrollHeight + 'px';
        toggleIcon.textContent = '▼';
      }
    });
  }
}

async function handleRegistration(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('#register-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const errorDiv = form.querySelector('#register-error');
  
  // Clear previous errors
  clearFormErrors(form);
  
  const registrationData = {
    name: formData.get('name')?.trim(),
    email: formData.get('email')?.trim(),
    password: formData.get('password'),
  };

  // Add optional fields if they have values
  const bio = formData.get('bio')?.trim();
  if (bio) {
    registrationData.bio = bio;
  }

  const avatarUrl = formData.get('avatarUrl')?.trim();
  const avatarAlt = formData.get('avatarAlt')?.trim();
  if (avatarUrl) {
    registrationData.avatar = {
      url: avatarUrl,
      alt: avatarAlt || registrationData.name
    };
  }

  const bannerUrl = formData.get('bannerUrl')?.trim();
  const bannerAlt = formData.get('bannerAlt')?.trim();
  if (bannerUrl) {
    registrationData.banner = {
      url: bannerUrl,
      alt: bannerAlt || `${registrationData.name}'s banner`
    };
  }

  const validation = validateRegistrationForm(registrationData);

  if (!validation.isValid) {
    displayFormErrors(form, validation.errors.map(error => ({ field: 'general', message: error })));
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  btnText.classList.add('hidden');
  btnLoading.classList.remove('hidden');

  try {
    const response = await register(registrationData);
    
    // Show success message with credits bonus information
    showSuccess(errorDiv, 'Account created successfully! You received 1000 credits as a welcome bonus. Redirecting to login...');
    
    // Redirect to login page after 3 seconds to let user read the message
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 3000);
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
  
  const inputs = form.querySelectorAll('input, textarea');
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
  errorDiv.style.color = 'var(--error)';
}

function showSuccess(successDiv, message) {
  successDiv.textContent = message;
  successDiv.classList.remove('hidden');
  successDiv.style.color = 'var(--success)';
}

export { createRegistrationPage };
