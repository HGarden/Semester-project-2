/**
 * Search functionality and utilities
 */
import { searchListings } from '../listings/listings.js';
import { showLoading, hideLoading } from './loading.js';

export function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  if (!searchInput || !searchBtn) return;
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // Add search suggestions functionality
  searchInput.addEventListener('input', debounce(handleSearchInput, 300));
}

export async function performSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  
  const query = searchInput.value.trim();
  
  if (!query) {
    // Dynamically import to avoid circular dependency
    const { loadFeaturedListings } = await import('./listings-display.js');
    await loadFeaturedListings();
    return;
  }
  
  try {
    showLoading();
    
    const listings = await searchListings(query, { 
      _seller: true, 
      _bids: true 
    });
    
    // Dynamically import to avoid circular dependency
    const { displayListings } = await import('./listings-display.js');
    displayListings(listings);
    
    // Update section title
    updateSearchResults(query, listings.length);
  } catch (error) {
    console.error('Search failed:', error);
    displayError('Search failed. Please try again.');
  } finally {
    hideLoading();
  }
}

function updateSearchResults(query, count) {
  const sectionTitle = document.querySelector('.section-header h2');
  const sectionDesc = document.querySelector('.section-header p');
  
  if (sectionTitle && sectionDesc) {
    sectionTitle.textContent = `Search Results for "${query}"`;
    sectionDesc.textContent = `Found ${count} auction${count !== 1 ? 's' : ''} matching your search`;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function handleSearchInput(e) {
  const query = e.target.value.trim();
  if (query.length < 2) return;
  
  // Could implement search suggestions here
  // For now, we'll just update the placeholder
  if (query) {
    e.target.placeholder = `Search for "${query}"...`;
  }
}

function displayError(message) {
  const container = document.getElementById('listings-container');
  
  // Hide loading before showing error
  hideLoading();
  
  if (!container) {
    console.error('Listings container not found');
    return;
  }
  
  container.innerHTML = `
    <div class="empty-state col-span-full">
      <div class="empty-icon">⚠️</div>
      <h3 class="empty-title">Something went wrong</h3>
      <p class="empty-description">${message}</p>
      <button onclick="window.loadFeaturedListings()" class="nav-button btn-primary">
        Try Again
      </button>
    </div>
  `;
}
