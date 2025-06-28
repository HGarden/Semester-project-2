function isLoggedIn() {
  return localStorage.getItem('access_token') !== null;
}

function getUserInfo() {
  if (!isLoggedIn()) {
    return null;
  }
  
  return {
    name: localStorage.getItem('user_name'),
    email: localStorage.getItem('user_email'),
    credits: parseInt(localStorage.getItem('user_credits')) || 0
  };
}

function updateUserCredits(credits) {
  localStorage.setItem('user_credits', credits.toString());
  
  // Update display in navigation
  const creditsElements = document.querySelectorAll('.credits-value');
  creditsElements.forEach(element => {
    element.textContent = credits;
  });
}

// Function to get fresh credits from API and update everywhere
async function refreshCreditsDisplay() {
  if (!isLoggedIn()) return;
  
  try {
    // Import here to avoid circular dependencies
    const { getProfile } = await import('../profiles/profile.js');
    const userInfo = getUserInfo();
    const profile = await getProfile(userInfo.name);
    
    updateUserCredits(profile.credits);
    return profile.credits;
  } catch (error) {
    console.error('Failed to refresh credits:', error);
    return null;
  }
}

export {
  isLoggedIn,
  getUserInfo,
  updateUserCredits,
  refreshCreditsDisplay
};
