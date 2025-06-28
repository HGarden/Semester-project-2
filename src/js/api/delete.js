import { getAccessToken, getApiKey } from '../utils/getToken.js';
import { getApiUrl } from '../utils/getApiUrl.js';

async function del(endpoint) {
  const url = getApiUrl() + endpoint;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`,
    'X-Noroff-API-Key': getApiKey()
  };

  const response = await fetch(url, {
    method: 'DELETE',
    headers
  });

  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      console.error('DELETE API Error Response:', errorData);
      errorMessage = errorData.errors?.[0]?.message || errorData.message || `HTTP error! status: ${response.status}`;
    } catch (parseError) {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export { del };