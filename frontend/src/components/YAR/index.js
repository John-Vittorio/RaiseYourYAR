// Export individual components
export { default as YARMain } from '../YARMain';
export { default as YARArchive } from '../YARArchive';
export { default as TeachingForm } from '../TeachingForm';
export { default as ResearchForm } from '../ResearchForm';
export { default as ServiceForm } from '../ServiceForm';
export { default as GeneralNotesForm } from '../GeneralNotesForm';
export { default as ReportReview } from '../ReportReview';
export { default as ReportCard } from '../ReportCard';
export { default as ResumeNotification } from '../ResumeNotification';

// Initialize navigation debugging - this will run once when the module is imported
// and set up the necessary debugging hooks for navigation
(function initYARNavigation() {
  // Set up navigation event handlers for debugging
  if (typeof window !== 'undefined') {
    // Track navigation state
    window.yarNavState = {
      lastView: null,
      currentView: null,
      navigationStack: []
    };

    // Define custom event for YAR navigation
    window.yarNavigationEvent = new CustomEvent('yarNavigation', {
      detail: { view: null }
    });

    // Simple debugging utility for YAR views
    window.logYARNavigation = function(from, to) {
      console.log(`YAR Navigation: ${from} → ${to}`);
      
      // Update navigation state
      window.yarNavState.lastView = from;
      window.yarNavState.currentView = to;
      window.yarNavState.navigationStack.push({ from, to, timestamp: new Date() });
      
      // Dispatch event
      window.yarNavigationEvent.detail.view = to;
      window.dispatchEvent(window.yarNavigationEvent);
    };

    // Add event listener to handle view transitions
    window.addEventListener('yarNavigation', function(e) {
      // This runs when YAR navigation events occur
      console.log('YAR Navigation Event:', e.detail.view);
      
      // Focus any buttons to ensure correct tab order
      setTimeout(() => {
        const nextButton = document.querySelector('.yar-button-next');
        if (nextButton) {
          nextButton.focus();
        }
      }, 100);
    });
    
    // Initialize CSS fixes for navigation buttons
    const style = document.createElement('style');
    style.innerHTML = `
      .yar-button-next {
        position: relative;
        z-index: 100;
      }
      
      .yar-button-next:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        z-index: -1;
      }
      
      .teaching-breadcrumb {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }
})();

// Export navigation helper functions
export const YARNavigationHelper = {
  navigateTo: function(view) {
    if (typeof window !== 'undefined') {
      window.logYARNavigation(window.yarNavState?.currentView || 'unknown', view);
    }
    return view;
  },
  
  fixNavigationIssues: function() {
    // This function can be called from components to fix any navigation issues
    if (typeof document !== 'undefined') {
      // Make buttons more prominent
      const nextButtons = document.querySelectorAll('.yar-button-next');
      nextButtons.forEach(button => {
        if (!button.hasAttribute('data-fixed')) {
          button.style.boxShadow = '0 0 10px rgba(75, 46, 131, 0.5)';
          button.setAttribute('data-fixed', 'true');
        }
      });
    }
  }
};
