import { get } from '../api/get.js';
import { post } from '../api/post.js';
import { put } from '../api/put.js';
import { del } from '../api/delete.js';

async function getListings(params = {}) {
  try {
    const response = await get('auction/listings', params);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }
}

async function getListing(id, includeBids = true) {
  try {
    const params = includeBids ? { _bids: true, _seller: true } : { _seller: true };
    const response = await get(`auction/listings/${id}`, params);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch listing: ${error.message}`);
  }
}

async function searchListings(query, params = {}) {
  try {
    const searchParams = {
      q: query,
      ...params
    };
    const response = await get('auction/listings/search', searchParams);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to search listings: ${error.message}`);
  }
}

async function createListing(listingData) {
  try {
    console.log('Creating listing with data:', listingData); // Debug log
    const response = await post('auction/listings', listingData);
    console.log('Create listing response:', response); // Debug log
    return response.data;
  } catch (error) {
    console.error('Create listing error:', error);
    // Provide more specific error messages
    if (error.message.includes('400')) {
      throw new Error('Invalid listing data. Please check all required fields.');
    } else if (error.message.includes('401')) {
      throw new Error('You must be logged in to create a listing.');
    } else if (error.message.includes('403')) {
      throw new Error('You do not have permission to create listings.');
    } else {
      throw new Error(`Failed to create listing: ${error.message}`);
    }
  }
}

async function updateListing(id, listingData) {
  try {
    const response = await put(`auction/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update listing: ${error.message}`);
  }
}

async function deleteListing(id) {
  try {
    const response = await del(`auction/listings/${id}`);
    return response;
  } catch (error) {
    throw new Error(`Failed to delete listing: ${error.message}`);
  }
}

export {
  getListings,
  getListing,
  searchListings,
  createListing,
  updateListing,
  deleteListing
};
