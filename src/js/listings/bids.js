import { post } from '../api/post.js';

async function placeBid(listingId, amount) {
  try {
    const bidData = {
      amount: parseFloat(amount)
    };
    
    const response = await post(`auction/listings/${listingId}/bids`, bidData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to place bid: ${error.message}`);
  }
}

export { placeBid };
