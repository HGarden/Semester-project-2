import { isLoggedIn, getUserInfo } from './utils/auth.js';
import { logout } from './api/auth/login/login.js';
import { getListing } from './listings/listings.js';
import { placeBid } from './listings/bids.js';

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeListingPage);

async function initializeListingPage() {
  
  
  // Get listing ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  
  if (!listingId) {
    displayError('No listing ID provided');
    return;
  }
  
  await loadListing(listingId);
}



async function loadListing(listingId) {
  const container = document.getElementById('listing-container');
  
  try {
    const listing = await getListing(listingId, true);
    displayListing(listing);
  } catch (error) {
    console.error('Failed to load listing:', error);
    displayError('Failed to load listing. Please try again later.');
  }
}

function displayListing(listing) {
  const container = document.getElementById('listing-container');
  const userInfo = getUserInfo();
  const isOwner = userInfo && userInfo.name === listing.seller?.name;
  const endDate = new Date(listing.endsAt);
  const isExpired = endDate < new Date();
  
  const currentBid = listing.bids && listing.bids.length > 0 
    ? Math.max(...listing.bids.map(bid => bid.amount))
    : 0;

  const imageGallery = listing.media && listing.media.length > 0 
    ? listing.media.map((media, index) => `
        <img 
          src="${media.url}" 
          alt="${media.alt || listing.title}"
          class="listing-main-image ${index === 0 ? '' : 'hidden'}"
          data-index="${index}"
          onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80'"
        >
      `).join('')
    : `<img 
        src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80" 
        alt="${listing.title}"
        class="listing-main-image"
      >`;

  container.innerHTML = `
    <div class="listing-detail-card">
      <div class="listing-content">
        <!-- Image Gallery -->
        <div class="listing-gallery">
          <div class="main-image-container">
            ${imageGallery}
          </div>
          ${listing.media && listing.media.length > 1 ? `
            <div class="thumbnails-container">
              ${listing.media.map((media, index) => `
                <button 
                  class="thumbnail-btn"
                  data-index="${index}"
                >
                  <img 
                    src="${media.url}" 
                    alt="${media.alt || listing.title}"
                    class="thumbnail-image"
                    onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80'"
                  >
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Listing Details -->
        <div class="listing-details">
          <div class="listing-header">
            <h1 class="listing-title">${listing.title}</h1>
            <p class="listing-seller">by ${listing.seller?.name || 'Unknown'}</p>
          </div>

          <div class="listing-description">
            <p>${listing.description || 'No description available'}</p>
          </div>

          <div class="listing-stats">
            <div class="stat-card">
              <div class="stat-label">Current Bid</div>
              <div class="stat-value stat-bid">
                ${currentBid > 0 ? `${currentBid} credits` : 'No bids yet'}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">${isExpired ? 'Ended' : 'Ends'}</div>
              <div class="stat-value ${isExpired ? 'stat-expired' : ''}">
                ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          ${!isExpired && isLoggedIn() && !isOwner ? `
            <div class="bid-section">
              <h3 class="bid-section-title">Place a Bid</h3>
              <form id="bid-form" class="bid-form">
                <input 
                  type="number" 
                  id="bid-amount" 
                  min="${currentBid + 1}"
                  step="1"
                  required
                  class="bid-input"
                  placeholder="Enter bid amount"
                >
                <button 
                  type="submit" 
                  class="btn-primary"
                >
                  Place Bid
                </button>
              </form>
              <p class="bid-credits-info">
                Your credits: <span class="credits-amount">${userInfo?.credits || 0}</span>
              </p>
              <div id="bid-error" class="error-message hidden"></div>
              <div id="bid-success" class="success-message hidden"></div>
            </div>
          ` : ''}

          ${!isLoggedIn() ? `
            <div class="login-prompt">
              <p class="login-prompt-text">Want to place a bid?</p>
              <a href="/login.html" class="btn-primary">
                Login to Bid
              </a>
            </div>
          ` : ''}

          ${isExpired ? `
            <div class="auction-ended">
              <p class="auction-ended-text">This auction has ended</p>
            </div>
          ` : ''}

          ${isOwner ? `
            <div class="owner-badge">
              <p class="owner-badge-text">This is your listing</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Bid History -->
      ${isLoggedIn() ? `
        <div class="bid-history-section">
          <h3 class="bid-history-title">Bid History</h3>
          <div id="bid-history">
            ${displayBidHistory(listing.bids)}
          </div>
        </div>
      ` : `
        <div class="bid-history-section">
          <div class="login-required">
            <h3 class="login-required-title">Bid History</h3>
            <p class="login-required-text">Please log in to view bid history</p>
          </div>
        </div>
      `}
    </div>
  `;

  // Setup image gallery
  setupImageGallery();
  
  // Setup bid form if it exists
  const bidForm = document.getElementById('bid-form');
  if (bidForm) {
    bidForm.addEventListener('submit', (e) => handleBidSubmission(e, listing.id));
  }
}

function setupImageGallery() {
  const thumbnails = document.querySelectorAll('.thumbnail-btn');
  const images = document.querySelectorAll('[data-index]');
  
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
      const index = thumbnail.dataset.index;
      
      // Hide all images
      images.forEach(img => img.classList.add('hidden'));
      
      // Show selected image
      const selectedImage = document.querySelector(`img[data-index="${index}"]`);
      if (selectedImage) {
        selectedImage.classList.remove('hidden');
      }
      
      // Update thumbnail styling
      thumbnails.forEach(btn => btn.classList.remove('active'));
      thumbnail.classList.add('active');
    });
  });
}

function displayBidHistory(bids) {
  if (!bids || bids.length === 0) {
    return '<p class="no-bids-text">No bids yet. Be the first to bid!</p>';
  }
  
  // Sort bids by amount (highest first)
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  
  return `
    <div class="bid-history-list">
      ${sortedBids.map((bid, index) => `
        <div class="bid-history-item ${index === 0 ? 'highest-bid' : ''}">
          <div class="bid-info">
            <span class="bidder-name">${bid.bidder?.name || 'Anonymous'}</span>
            ${index === 0 ? '<span class="highest-bid-badge">Highest Bid</span>' : ''}
          </div>
          <div class="bid-details">
            <span class="bid-amount">${bid.amount} credits</span>
            <span class="bid-date">${new Date(bid.created).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function handleBidSubmission(event, listingId) {
  event.preventDefault();
  
  const bidAmountInput = document.getElementById('bid-amount');
  const bidAmount = parseInt(bidAmountInput.value);
  const errorDiv = document.getElementById('bid-error');
  const successDiv = document.getElementById('bid-success');
  
  // Clear previous messages
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
  
  try {
    await placeBid(listingId, bidAmount);
    
    successDiv.textContent = 'Bid placed successfully!';
    successDiv.classList.remove('hidden');
    
    // Clear the form
    bidAmountInput.value = '';
    
    // Reload the listing to show updated bid
    setTimeout(() => {
      loadListing(listingId);
    }, 1000);
    
  } catch (error) {
    console.error('Failed to place bid:', error);
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}

function displayError(message) {
  const container = document.getElementById('listing-container');
  container.innerHTML = `
    <div class="error-display">
      <p class="error-message">${message}</p>
      <a href="/" class="btn-primary">
        Back to Home
      </a>
    </div>
  `;
}
