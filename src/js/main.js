import { hideLoading } from './utils/loading.js';
import { setupNavigation, setupMobileMenu, initializeNavigation, refreshUserCredits } from './utils/navigation.js';
import { setupAnimations, setupScrollEffects } from './utils/animations.js';
import { loadFeaturedListings } from './utils/listings-display.js';
import { setupSearch } from './utils/search.js';
import { isLoggedIn } from './utils/auth.js';

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

async function initializePage() {
  // Hide loading initially
  hideLoading();
  
  // Initialize all modules
  setupNavigation();
  setupMobileMenu();
  setupScrollEffects();
  
  // Refresh user credits if logged in
  if (isLoggedIn()) {
    await refreshUserCredits();
  }
  
  await loadFeaturedListings();
  setupSearch();
  setupAnimations();
}

// Export for use by other pages
export { initializeNavigation, refreshUserCredits };

// Make functions globally available for HTML onclick handlers
window.viewListing = function(listingId) {
  window.location.href = `/listing.html?id=${listingId}`;
};

window.loadFeaturedListings = loadFeaturedListings;
