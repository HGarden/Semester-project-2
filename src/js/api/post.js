import { getAccessToken, getApiKey } from '../utils/getToken.js';
import { getApiUrl } from '../utils/getApiUrl.js';

async function post(endpoint, data) {
  const url = getApiUrl() + endpoint;
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Noroff-API-Key': getApiKey()
  };

  // Add authorization header if token is available
  try {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    // Token not available, continue without authorization
  }

  console.log('POST request:', { url, data, headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : 'none' } });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      errorMessage = errorData.errors?.[0]?.message || errorData.message || `HTTP error! status: ${response.status}`;
    } catch (parseError) {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  console.log('POST response:', responseData);
  return responseData;
}

export { post };

