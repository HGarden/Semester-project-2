import { isLoggedIn, getUserInfo } from './utils/auth.js';
import { logout } from './api/auth/login/login.js';
import { getListings, searchListings } from './listings/listings.js';
import { refreshUserCredits } from './utils/navigation.js';

let currentPage = 1;
let currentFilter = 'all';
let currentSearch = '';
let allListings = [];
let hasMoreListings = true;

// Initialize the auctions page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAuctionsPage);

async function initializeAuctionsPage() {
  // Refresh user credits if logged in
  if (isLoggedIn()) {
    await refreshUserCredits();
  }
  
  setupFilters();
  setupSearch();
  setupLoadMore();
  await loadAuctions();
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Update active filter button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Set current filter and reset pagination
      currentFilter = btn.id.replace('filter-', '');
      currentPage = 1;
      allListings = [];
      hasMoreListings = true;
      
      // Load auctions with new filter
      await loadAuctions();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const clearBtn = document.getElementById('clear-search-btn');
  
  searchBtn.addEventListener('click', performSearch);
  clearBtn.addEventListener('click', clearSearch);
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

async function performSearch() {
  const searchInput = document.getElementById('search-input');
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  allListings = [];
  hasMoreListings = true;
  
  if (currentSearch) {
    try {
      showLoading(true);
      const results = await searchListings(currentSearch, { 
        _seller: true, 
        _bids: true,
        limit: 12,
        page: currentPage
      });
      allListings = results;
      hasMoreListings = results.length === 12;
      filterAndDisplayListings();
      updateLoadMoreButton();
    } catch (error) {
      console.error('Search failed:', error);
      displayError('Search failed. Please try again.');
    } finally {
      showLoading(false);
    }
  } else {
    await loadAuctions();
  }
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  currentSearch = '';
  currentPage = 1;
  allListings = [];
  hasMoreListings = true;
  loadAuctions();
}

async function loadAuctions(append = false) {
  try {
    showLoading(true);
    const params = { 
      limit: 12,
      page: currentPage,
      _seller: true, 
      _bids: true 
    };
    
    const listings = await getListings(params);
    
    if (append) {
      allListings = [...allListings, ...listings];
    } else {
      allListings = listings;
    }
    
    hasMoreListings = listings.length === 12;
    filterAndDisplayListings();
    updateLoadMoreButton();
  } catch (error) {
    console.error('Failed to load auctions:', error);
    displayError('Failed to load auctions. Please try again later.');
  } finally {
    showLoading(false);
  }
}

function filterAndDisplayListings() {
  let filteredListings = [...allListings];
  
  // Apply filter
  if (currentFilter === 'active') {
    filteredListings = filteredListings.filter(listing => new Date(listing.endsAt) > new Date());
  } else if (currentFilter === 'ended') {
    filteredListings = filteredListings.filter(listing => new Date(listing.endsAt) <= new Date());
  }
  // 'all' filter shows everything, no filtering needed
  
  console.log(`Filter: ${currentFilter}, Total listings: ${allListings.length}, Filtered: ${filteredListings.length}`);
  displayListings(filteredListings);
  
  // Update load more button based on filtered results
  // If we're filtering and showing fewer results than total, we might not want to load more
  const shouldShowLoadMore = currentFilter === 'all' ? hasMoreListings : (filteredListings.length < allListings.length && hasMoreListings);
  updateLoadMoreButtonVisibility(shouldShowLoadMore);
}

function displayListings(listings) {
  const container = document.getElementById('auctions-container');
  
  if (!listings || listings.length === 0) {
    container.innerHTML = '<p class="empty-message">No auctions found.</p>';
    return;
  }
  
  container.innerHTML = listings.map(listing => createListingCard(listing)).join('');
}

function createListingCard(listing) {
  const currentBid = listing.bids && listing.bids.length > 0 
    ? Math.max(...listing.bids.map(bid => bid.amount))
    : 0;
    
  const imageUrl = listing.media && listing.media.length > 0 
    ? listing.media[0].url 
    : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80';
    
  const endDate = new Date(listing.endsAt);
  const isExpired = endDate < new Date();
  
  return `
    <div class="auction-card" onclick="viewListing('${listing.id}')">
      <div class="card-image">
        <img 
          src="${imageUrl}" 
          alt="${listing.title}"
          onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80'"
        >
      </div>
      <div class="card-content">
        <h3>${listing.title}</h3>
        <p class="card-description">${listing.description || 'No description available'}</p>
        
        <div class="card-meta">
          <div class="seller-info">by ${listing.seller?.name || 'Unknown'}</div>
          <div class="end-date ${isExpired ? 'expired' : ''}">
            ${isExpired ? 'Ended' : 'Ends'} ${endDate.toLocaleDateString()}
          </div>
        </div>
        
        <div class="card-footer">
          <div class="current-bid">
            ${currentBid > 0 ? `${currentBid} credits` : 'No bids yet'}
          </div>
          <div class="view-details-btn" tabindex="0">View Details</div>
        </div>
      </div>
    </div>
  `;
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  if (show) {
    loading.classList.remove('hidden');
  } else {
    loading.classList.add('hidden');
  }
}

function displayError(message) {
  const container = document.getElementById('auctions-container');
  container.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
    </div>
  `;
}

function setupLoadMore() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      currentPage++;
      await loadAuctions(true); // Pass true to append results
    });
  }
}

function updateLoadMoreButton() {
  updateLoadMoreButtonVisibility(hasMoreListings);
}

function updateLoadMoreButtonVisibility(shouldShow) {
  const loadMoreBtn = document.getElementById('load-more-btn');
  const loadMoreContainer = document.getElementById('load-more-container');
  
  if (loadMoreBtn && loadMoreContainer) {
    if (shouldShow && allListings.length > 0) {
      loadMoreBtn.classList.remove('hidden');
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreBtn.classList.add('hidden');
      loadMoreContainer.style.display = 'none';
    }
  }
}

// Make viewListing function globally available
window.viewListing = function(listingId) {
  window.location.href = `/listing.html?id=${listingId}`;
};
