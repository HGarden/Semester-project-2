function getAccessToken() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Access token not found in local storage');
  }
  return token;
}

function hasAccessToken() {
  return localStorage.getItem('access_token') !== null;
}

function getApiKey() {
  return '42d83a99-a1fd-4cfd-aecd-42f599ba6f54';
}

export { getAccessToken, hasAccessToken, getApiKey };
// This function retrieves the access token from local storage.
// If the token is not found, it throws an error.
// hasAccessToken can be used to check if a token exists without throwing an error.
// getApiKey returns the Noroff API key required for authenticated requests.
