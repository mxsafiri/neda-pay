'use client';

import { useEffect } from 'react';

/**
 * Component that injects custom styling for the NEDApay wallet authentication UI
 * This replaces the previous PrivyTagline component with wallet-specific styling
 */
export function WalletTagline() {
  useEffect(() => {
    // Create a style element for the wallet auth styling
    const styleElement = document.createElement('style');
    
    // Add the CSS for the wallet auth styling
    styleElement.textContent = `
      /* NEDApay branding */
      .wallet-auth-logo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      
      .nedapay-tagline {
        display: block;
        text-align: center;
        margin-top: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
      }
      
      /* Card styling enhancements */
      .wallet-auth-card {
        border-color: rgba(255, 255, 255, 0.1);
        background-color: rgba(10, 31, 68, 0.8);
        backdrop-filter: blur(10px);
      }
      
      /* Input styling */
      .wallet-auth-input {
        background-color: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.2);
        color: white;
        font-family: var(--font-geist-mono);
      }
      
      .wallet-auth-input:focus {
        border-color: rgba(255, 255, 255, 0.4);
        outline: none;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
      }
      
      /* Button styling */
      .wallet-auth-button {
        transition: all 0.2s ease;
      }
      
      .wallet-auth-button-primary {
        background-color: #0A1F44;
        color: white;
      }
      
      .wallet-auth-button-primary:hover {
        background-color: #152a4f;
      }
      
      .wallet-auth-button-secondary {
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
      }
      
      .wallet-auth-button-secondary:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }
      
      /* Private key display */
      .wallet-auth-private-key {
        font-family: var(--font-geist-mono);
        letter-spacing: 0.5px;
        word-break: break-all;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* Tabs styling */
      .wallet-auth-tabs-list {
        background-color: rgba(255, 255, 255, 0.05);
        padding: 4px;
        border-radius: 8px;
      }
      
      .wallet-auth-tab {
        color: rgba(255, 255, 255, 0.7);
        border-radius: 6px;
        transition: all 0.2s ease;
      }
      
      .wallet-auth-tab[data-state="active"] {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }
    `;
    
    // Append the style element to the document head
    document.head.appendChild(styleElement);
    
    return () => {
      // Clean up the style element when component unmounts
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return null; // This component doesn't render anything visible
}
