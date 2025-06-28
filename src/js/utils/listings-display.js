/**
 * Listings display and card creation utilities
 */
import { getListings } from '../listings/listings.js';
import { showLoading, hideLoading } from './loading.js';

export async function loadFeaturedListings() {
  const container = document.getElementById('listings-container');
  
  try {
    // Show loading and clear container
    showLoading();
    if (container) {
      container.innerHTML = '';
    }
    
    const listings = await getListings({ 
      limit: 6, 
      _seller: true, 
      _bids: true 
    });
    
    displayListings(listings);
  } catch (error) {
    console.error('Failed to load listings:', error);
    displayError('Failed to load auctions. Please try again later.');
  } finally {
    hideLoading();
  }
}

export function displayListings(listings) {
  const container = document.getElementById('listings-container');
  
  // Hide loading before displaying content
  hideLoading();
  
  if (!container) {
    console.error('Listings container not found');
    return;
  }
  
  if (!listings || listings.length === 0) {
    container.innerHTML = `
      <div class="empty-state col-span-full">
        <div class="empty-icon">🏺</div>
        <h3 class="empty-title">No auctions available</h3>
        <p class="empty-description">Check back later for new exciting auctions!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = listings.map(listing => createListingCard(listing)).join('');
}

export function createListingCard(listing) {
  const currentBid = listing.bids && listing.bids.length > 0 
    ? Math.max(...listing.bids.map(bid => bid.amount))
    : 0;
    
  const imageUrl = listing.media && listing.media.length > 0 
    ? listing.media[0].url 
    : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80';
    
  const endDate = new Date(listing.endsAt);
  const isExpired = endDate < new Date();
  const isEndingSoon = !isExpired && (endDate - new Date()) < 24 * 60 * 60 * 1000;
  
  let statusClass = 'active';
  let statusText = 'Active';
  
  if (isExpired) {
    statusClass = 'ended';
    statusText = 'Ended';
  } else if (isEndingSoon) {
    statusClass = 'ending-soon';
    statusText = 'Ending Soon';
  }
  
  return `
    <div class="auction-card" onclick="viewListing('${listing.id}')">
      <div class="card-image">
        <img 
          src="${imageUrl}" 
          alt="${listing.title}"
          onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80'"
        >
        <div class="image-overlay"></div>
        <div class="status-badge ${statusClass}">${statusText}</div>
      </div>
      
      <div class="card-content">
        <h3 class="card-title">${listing.title}</h3>
        <p class="card-description">${listing.description || 'No description available'}</p>
        
        <div class="card-meta">
          <div class="seller-info">${listing.seller?.name || 'Unknown'}</div>
          <div class="end-date ${isExpired ? 'ended' : isEndingSoon ? 'ending-soon' : ''}">
            ${endDate.toLocaleDateString()}
          </div>
        </div>
        
        <div class="card-footer">
          <div class="current-bid">
            <div class="bid-label">Current Bid</div>
            <div class="bid-amount ${currentBid > 0 ? '' : 'no-bids'}">
              ${currentBid > 0 ? `${currentBid} credits` : 'No bids yet'}
            </div>
          </div>
          <button class="view-button" onclick="event.stopPropagation(); viewListing('${listing.id}')" tabindex="0">
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
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
