import { getAccessToken, hasAccessToken, getApiKey } from "../utils/getToken";
import { getApiUrl } from "../utils/getApiUrl";

async function get(endpoint, params = {}) {
  const url = new URL(getApiUrl() + endpoint);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const headers = {
    'Content-Type': 'application/json',
    'X-Noroff-API-Key': getApiKey()
  };

  // Add authorization header if token is available
  if (hasAccessToken()) {
    try {
      const token = getAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
      console.log('GET request with auth token and API key to:', url.toString());
    } catch (error) {
      console.warn('Failed to get access token:', error);
    }
  } else {
    console.warn('No access token available for GET request to:', url.toString());
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      console.error('GET API Error Response:', errorData);
      errorMessage = errorData.errors?.[0]?.message || errorData.message || `HTTP error! status: ${response.status}`;
    } catch (parseError) {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  console.log('GET response:', responseData);
  return responseData;
}

export { get };
// This module exports a function `get` that performs a GET request to the specified endpoint.

