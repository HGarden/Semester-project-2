/**
 * Navigation and mobile menu functionality
 */
import { isLoggedIn, getUserInfo, updateUserCredits } from './auth.js';
import { logout } from '../api/auth/login/login.js';
import { getProfile } from '../profiles/profile.js';

export function setupNavigation() {
  const authNav = document.getElementById('auth-nav');
  const mobileAuthNav = document.getElementById('mobile-auth-nav');
  
  if (!authNav || !mobileAuthNav) return;
  
  if (isLoggedIn()) {
    const userInfo = getUserInfo();
    const authContent = `
      <div class="user-credits">
        Credits: <span class="credits-value">${userInfo.credits}</span>
      </div>
      <a href="/profile.html" class="nav-button btn-ghost">Profile</a>
      <a href="/create-listing.html" class="nav-button btn-secondary">Create Listing</a>
      <button id="logout-btn" class="nav-button btn-danger">Logout</button>
    `;
    
    authNav.innerHTML = `<div class="auth-section">${authContent}</div>`;
    mobileAuthNav.innerHTML = authContent;
    
    const logoutBtns = document.querySelectorAll('#logout-btn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', handleLogout);
    });
  } else {
    const authContent = `
      <a href="/login.html" class="nav-button btn-ghost">Login</a>
      <a href="/register.html" class="nav-button btn-primary">Register</a>
    `;
    
    authNav.innerHTML = `<div class="auth-section">${authContent}</div>`;
    mobileAuthNav.innerHTML = authContent;
  }
}

export function setupMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!mobileMenuToggle || !mobileMenu) return;
  
  const hamburger = mobileMenuToggle.querySelector('.hamburger');
  if (!hamburger) return;
  
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });
}

function handleLogout() {
  logout();
}

// Export for use by other pages
export function initializeNavigation() {
  setupNavigation();  
  setupMobileMenu();
}

export async function refreshUserCredits() {
  if (!isLoggedIn()) return;
  
  try {
    const userInfo = getUserInfo();
    const profile = await getProfile(userInfo.name);
    
    // Update stored credits
    updateUserCredits(profile.credits);
    
    // Update display
    const creditsElements = document.querySelectorAll('.credits-value');
    creditsElements.forEach(element => {
      element.textContent = profile.credits;
    });
    
    console.log('Credits refreshed:', profile.credits);
  } catch (error) {
    console.error('Failed to refresh credits:', error);
  }
}
