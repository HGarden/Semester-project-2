import { isLoggedIn, getUserInfo } from './utils/auth.js';
import { logout } from './api/auth/login/login.js';
import { createListing } from './listings/listings.js';
import { refreshUserCredits } from './utils/navigation.js';

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCreateListingPage);

async function initializeCreateListingPage() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return;
  }


  
  // Refresh credits to show current amount
  await refreshUserCredits();
  
  displayCreateListingForm();
}



function displayCreateListingForm() {
  const container = document.getElementById('create-listing-container');
  
  container.innerHTML = `
    <div class="create-listing-card">
      <div class="create-listing-header">
        <h1>Create New Listing</h1>
      </div>
      
      <form id="create-listing-form" class="create-listing-form">
        <div class="form-group">
          <label for="title">Title *</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required 
            maxlength="280"
            placeholder="Enter listing title"
          >
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            name="description" 
            rows="4"
            maxlength="280"
            placeholder="Describe your item..."
          ></textarea>
          <p class="form-hint">Maximum 280 characters</p>
        </div>

        <div class="form-group">
          <label for="endsAt">Auction End Date *</label>
          <input 
            type="datetime-local" 
            id="endsAt" 
            name="endsAt" 
            required 
          >
          <p class="form-hint">Select when the auction should end</p>
        </div>

        <div class="form-group">
          <label>Media Gallery</label>
          <div id="media-container" class="media-container">
            <div class="media-item">
              <div class="media-inputs">
                <div class="input-group">
                  <label class="input-label">Image URL</label>
                  <input 
                    type="url" 
                    name="mediaUrl" 
                    class="media-url-input"
                    placeholder="https://example.com/image.jpg"
                  >
                </div>
                <div class="input-group">
                  <label class="input-label">Alt Text</label>
                  <input 
                    type="text" 
                    name="mediaAlt" 
                    class="media-alt-input"
                    placeholder="Description of the image"
                  >
                </div>
              </div>
            </div>
          </div>
          <button 
            type="button" 
            id="add-media-btn"
            class="add-media-btn"
          >
            + Add Another Image
          </button>
          <p class="form-hint">Add up to 8 images to showcase your item</p>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
          >
            Create Listing
          </button>
          <button 
            type="button" 
            id="cancel-btn"
            class="btn-secondary"
          >
            Cancel
          </button>
        </div>
        
        <div id="create-error" class="error-message hidden"></div>
        <div id="create-success" class="success-message hidden"></div>
      </form>
    </div>
  `;

  setupFormHandlers();
}

function setupFormHandlers() {
  const form = document.getElementById('create-listing-form');
  const addMediaBtn = document.getElementById('add-media-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  // Set minimum date to current date
  const endsAtInput = document.getElementById('endsAt');
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  endsAtInput.min = now.toISOString().slice(0, 16);
  
  // Set default to 7 days from now
  const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  defaultEnd.setMinutes(defaultEnd.getMinutes() - defaultEnd.getTimezoneOffset());
  endsAtInput.value = defaultEnd.toISOString().slice(0, 16);

  form.addEventListener('submit', handleCreateListing);
  addMediaBtn.addEventListener('click', addMediaField);
  cancelBtn.addEventListener('click', () => window.location.href = '/');
}

function addMediaField() {
  const container = document.getElementById('media-container');
  const mediaItems = container.querySelectorAll('.media-item');
  
  if (mediaItems.length >= 8) {
    alert('You can add up to 8 images maximum.');
    return;
  }
  
  const mediaItem = document.createElement('div');
  mediaItem.className = 'media-item';
  mediaItem.innerHTML = `
    <div class="media-item-header">
      <span class="media-item-label">Image ${mediaItems.length + 1}</span>
      <button 
        type="button" 
        class="remove-media-btn"
      >
        Remove
      </button>
    </div>
    <div class="media-inputs">
      <div class="input-group">
        <label class="input-label">Image URL</label>
        <input 
          type="url" 
          name="mediaUrl" 
          class="media-url-input"
          placeholder="https://example.com/image.jpg"
        >
      </div>
      <div class="input-group">
        <label class="input-label">Alt Text</label>
        <input 
          type="text" 
          name="mediaAlt" 
          class="media-alt-input"
          placeholder="Description of the image"
        >
      </div>
    </div>
  `;
  
  // Add remove functionality
  const removeBtn = mediaItem.querySelector('.remove-media-btn');
  removeBtn.addEventListener('click', () => {
    mediaItem.remove();
    updateMediaNumbers();
  });
  
  container.appendChild(mediaItem);
}

function updateMediaNumbers() {
  const mediaItems = document.querySelectorAll('.media-item');
  mediaItems.forEach((item, index) => {
    const label = item.querySelector('span');
    if (label) {
      label.textContent = `Image ${index + 1}`;
    }
  });
}

async function handleCreateListing(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const errorDiv = document.getElementById('create-error');
  const successDiv = document.getElementById('create-success');
  
  // Clear previous messages
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
  
  try {
    // Collect form data
    const listingData = {
      title: formData.get('title').trim(),
      endsAt: new Date(formData.get('endsAt')).toISOString()
    };
    
    // Add description if provided
    const description = formData.get('description')?.trim();
    if (description) {
      listingData.description = description;
    }
    
    // Collect media data - ensure it's an array even if empty
    const mediaUrls = formData.getAll('mediaUrl');
    const mediaAlts = formData.getAll('mediaAlt');
    const media = [];
    
    for (let i = 0; i < mediaUrls.length; i++) {
      if (mediaUrls[i] && mediaUrls[i].trim()) {
        media.push({
          url: mediaUrls[i].trim(),
          alt: mediaAlts[i]?.trim() || listingData.title
        });
      }
    }
    
    // Only add media if there are valid entries
    if (media.length > 0) {
      listingData.media = media;
    }
    
    // Validate required fields
    if (!listingData.title) {
      throw new Error('Title is required');
    }
    
    if (!listingData.endsAt) {
      throw new Error('End date is required');
    }
    
    // Check if end date is in the future
    const endDate = new Date(listingData.endsAt);
    const now = new Date();
    if (endDate <= now) {
      throw new Error('End date must be in the future');
    }
    
    // Ensure end date is at least 1 hour from now
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    if (endDate < oneHourFromNow) {
      throw new Error('End date must be at least 1 hour from now');
    }
    
    console.log('Sending listing data:', listingData); // Debug log
    
    // Create the listing
    const response = await createListing(listingData);
    
    successDiv.textContent = 'Listing created successfully!';
    successDiv.classList.remove('hidden');
    
    // Clear the form
    event.target.reset();
    
    // Redirect to the new listing after 2 seconds
    setTimeout(() => {
      window.location.href = `/listing.html?id=${response.id}`;
    }, 2000);
    
  } catch (error) {
    console.error('Failed to create listing:', error);
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}
