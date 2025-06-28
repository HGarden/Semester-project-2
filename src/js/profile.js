import { isLoggedIn, getUserInfo } from './utils/auth.js';
import { logout } from './api/auth/login/login.js';
import { getProfile, updateAvatar } from './profiles/profile.js';
import { refreshUserCredits } from './utils/navigation.js';

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProfilePage);

async function initializeProfilePage() {
  console.log('Initializing profile page...');
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    console.log('User not logged in, redirecting to login');
    window.location.href = '/login.html';
    return;
  }

  const userInfo = getUserInfo();
  console.log('User info:', userInfo);
  console.log('Access token exists:', localStorage.getItem('access_token') ? 'Yes' : 'No');

  
  // Refresh credits before loading profile
  await refreshUserCredits();
  
  await loadProfile();
}


async function loadProfile() {
  const userInfo = getUserInfo();
  const container = document.getElementById('profile-container');

  // Check if we have valid user info
  if (!userInfo || !userInfo.name) {
    console.error('No valid user info found');
    window.location.href = '/login.html';
    return;
  }

  try {
    console.log('Loading profile for user:', userInfo.name);
    const profile = await getProfile(userInfo.name);
    console.log('Profile loaded successfully:', profile);
    displayProfile(profile);
  } catch (error) {
    console.error('Failed to load profile:', error);
    
    // If it's a 401 error, the token might be expired
    if (error.message.includes('401')) {
      console.log('Token appears to be expired, redirecting to login');
      // Clear stored credentials and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_credits');
      window.location.href = '/login.html';
      return;
    }
    
    // For other errors, display a basic profile form
    displayProfileError(error.message);
  }
}

function displayProfile(profile) {
  const container = document.getElementById('profile-container');
  
  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <h1>My Profile</h1>
        <button 
          id="edit-profile-btn"
          class="btn-primary"
        >
          Edit Profile
        </button>
      </div>

      <div class="profile-content">
        <div class="profile-avatar-section">
          <img 
            src="${profile.avatar?.url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'}" 
            alt="${profile.name}"
            class="profile-avatar"
            onerror="this.src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'"
          >
          <h2 class="profile-name">${profile.name}</h2>
          <p class="profile-email">${profile.email}</p>
        </div>

        <div class="profile-stats-section">
          <div class="profile-stats">
            <div class="stat-item stat-credits">
              <div class="stat-value">${profile.credits || 0}</div>
              <div class="stat-label">Credits</div>
            </div>
            <div class="stat-item stat-listings">
              <div class="stat-value">${profile._count?.listings || 0}</div>
              <div class="stat-label">Listings</div>
            </div>
            <div class="stat-item stat-wins">
              <div class="stat-value">${profile._count?.wins || 0}</div>
              <div class="stat-label">Wins</div>
            </div>
          </div>

          ${profile.bio ? `
            <div class="profile-bio">
              <h3>Bio</h3>
              <p>${profile.bio}</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="listings-section">
      <h2>My Listings</h2>
      <div id="user-listings">
        <!-- User listings will be loaded here -->
      </div>
    </div>
  `;

  document.getElementById('edit-profile-btn').addEventListener('click', () => showEditForm(profile));
  loadUserListings(profile.name);
}

function displayProfileForm(userInfo) {
  const container = document.getElementById('profile-container');
  
  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <h1>My Profile</h1>
      </div>
      
      <div class="profile-content">
        <div class="profile-avatar-section">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80" 
            alt="${userInfo.name}"
            class="profile-avatar"
          >
          <h2 class="profile-name">${userInfo.name}</h2>
          <p class="profile-email">${userInfo.email}</p>
          <p class="profile-credits">Credits: ${userInfo.credits}</p>
        </div>

        <div class="profile-actions">
          <button id="edit-profile-btn" class="btn-primary">
            Update Avatar
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('edit-profile-btn').addEventListener('click', () => showEditForm({ ...userInfo, avatar: null }));
}

function showEditForm(profile) {
  const container = document.getElementById('profile-container');
  
  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <h1>Edit Profile</h1>
      </div>
      
      <form id="profile-form" class="profile-edit-form">
        <div class="profile-avatar-section">
          <img 
            id="avatar-preview"
            src="${profile.avatar?.url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'}" 
            alt="${profile.name}"
            class="profile-avatar"
          >
        </div>

        <div class="form-group">
          <label for="avatar-url">Avatar URL</label>
          <input 
            type="url" 
            id="avatar-url" 
            name="avatarUrl" 
            value="${profile.avatar?.url || ''}"
            placeholder="https://example.com/avatar.jpg"
          >
        </div>

        <div class="form-group">
          <label for="avatar-alt">Avatar Alt Text</label>
          <input 
            type="text" 
            id="avatar-alt" 
            name="avatarAlt" 
            value="${profile.avatar?.alt || profile.name}"
            placeholder="Alt text for avatar"
          >
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
          >
            Save Changes
          </button>
          <button 
            type="button" 
            id="cancel-btn"
            class="btn-secondary"
          >
            Cancel
          </button>
        </div>
        
        <div id="profile-error" class="error-message hidden"></div>
        <div id="profile-success" class="success-message hidden"></div>
      </form>
    </div>
  `;

  // Setup form handlers
  const avatarUrlInput = document.getElementById('avatar-url');
  const avatarPreview = document.getElementById('avatar-preview');
  
  avatarUrlInput.addEventListener('input', (e) => {
    if (e.target.value) {
      avatarPreview.src = e.target.value;
    }
  });

  document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
  document.getElementById('cancel-btn').addEventListener('click', () => loadProfile());
}

async function handleProfileUpdate(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const avatarUrl = formData.get('avatarUrl');
  const avatarAlt = formData.get('avatarAlt');
  
  const errorDiv = document.getElementById('profile-error');
  const successDiv = document.getElementById('profile-success');
  
  try {
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    
    const userInfo = getUserInfo();
    const avatarData = {
      url: avatarUrl,
      alt: avatarAlt || userInfo.name
    };
    
    await updateAvatar(userInfo.name, avatarData);
    
    successDiv.textContent = 'Profile updated successfully!';
    successDiv.classList.remove('hidden');
    
    // Reload profile after 1 second
    setTimeout(() => {
      loadProfile();
    }, 1000);
    
  } catch (error) {
    console.error('Failed to update profile:', error);
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

async function loadUserListings(userName) {
  // This would load the user's listings - for now just show a placeholder
  const container = document.getElementById('user-listings');
  container.innerHTML = `
    <div class="empty-listings">
      <p class="empty-listings-text">Your listings will appear here once you create some.</p>
      <div class="empty-listings-actions">
        <a href="/create-listing.html" class="btn-primary">
          Create Your First Listing
        </a>
      </div>
    </div>
  `;
}

function displayProfileError(errorMessage) {
  const container = document.getElementById('profile-container');
  
  container.innerHTML = `
    <div class="profile-error">
      <div class="error-card">
        <h2>Unable to Load Profile</h2>
        <p class="error-message">${errorMessage}</p>
        <div class="error-actions">
          <button onclick="window.location.reload()" class="btn-primary">Try Again</button>
          <button onclick="window.location.href='/login.html'" class="btn-secondary">Login Again</button>
        </div>
      </div>
    </div>
  `;
}
