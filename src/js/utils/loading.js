/**
 * Loading indicator utilities
 */

export function showLoading() {
  const loadingDiv = document.getElementById('loading');
  if (loadingDiv) {
    loadingDiv.classList.remove('hidden');
  }
}

export function hideLoading() {
  const loadingDiv = document.getElementById('loading');
  if (loadingDiv) {
    loadingDiv.classList.add('hidden');
  }
}
