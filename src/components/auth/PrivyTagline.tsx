'use client';

import { useEffect } from 'react';

/**
 * Component that injects a tagline under the NEDApay logo in the Privy authentication modal
 * This is done by both injecting a style tag and using a MutationObserver to add the tagline
 * directly when the logo container appears in the DOM
 */
export function PrivyTagline() {
  useEffect(() => {
    // Create a style element for the base styling
    const styleElement = document.createElement('style');
    
    // Add the CSS for the tagline styling and custom Privy appearance
    styleElement.textContent = `
      /* Tagline styling */
      .nedapay-tagline {
        display: block;
        text-align: center;
        margin-top: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
      }
      
      /* Custom modal styling */
      [class*="StyledDialog"] {
        border-radius: 16px !important;
      }
      
      /* Custom overlay styling */
      [class*="DialogOverlay"] {
        background-color: rgba(0, 0, 0, 0.8) !important;
      }
      
      /* Primary button styling */
      [class*="PrimaryButton"] {
        background-color: #0A1F44 !important;
        border-radius: 12px !important;
        color: white !important;
      }
      
      /* Secondary button styling */
      [class*="SecondaryButton"] {
        background-color: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        border-width: 1px !important;
        border-radius: 12px !important;
        color: white !important;
        font-weight: 500 !important;
      }
    `;
    
    // Append the style element to the document head
    document.head.appendChild(styleElement);
    
    // Function to add the tagline to the logo container
    const addTagline = () => {
      // Look for the Privy logo container
      // We're using attribute selectors to find elements that might contain the logo
      // This is more resilient to class name changes
      const logoContainers = document.querySelectorAll('div[class*="AppLogoContainer"]');
      
      logoContainers.forEach(container => {
        // Check if this container already has our tagline
        if (!container.querySelector('.nedapay-tagline')) {
          // Create the tagline element
          const tagline = document.createElement('div');
          tagline.className = 'nedapay-tagline';
          tagline.textContent = 'Secure Payments for Africa';
          
          // Add the tagline after the logo
          container.appendChild(tagline);
          
          // Add some bottom padding to the container
          // Type assertion to HTMLElement since we know it's a div
          (container as HTMLElement).style.paddingBottom = '10px';
        }
      });
    };
    
    // Try to add the tagline immediately in case the modal is already open
    addTagline();
    
    // Set up a MutationObserver to watch for the Privy modal being added to the DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          // When new nodes are added, check if we need to add our tagline
          addTagline();
        }
      }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Clean up function
    return () => {
      // Disconnect the observer
      observer.disconnect();
      
      // Remove the style element
      document.head.removeChild(styleElement);
      
      // Remove any taglines we added
      document.querySelectorAll('.nedapay-tagline').forEach(el => el.remove());
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}
