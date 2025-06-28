/**
 * Animation and visual effects utilities
 */

export function setupAnimations() {
  // Add stagger classes to auction cards as they're created
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-fade-in-up');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  });
  
  // Observe auction cards when they're added
  const observeCards = () => {
    const cards = document.querySelectorAll('.auction-card:not(.animate-fade-in-up)');
    cards.forEach(card => observer.observe(card));
  };
  
  // Set up a mutation observer to watch for new cards
  const mutationObserver = new MutationObserver(observeCards);
  const container = document.getElementById('listings-container');
  if (container) {
    mutationObserver.observe(container, {
      childList: true,
      subtree: true
    });
  }
}

export function setupScrollEffects() {
  const header = document.getElementById('main-header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}
