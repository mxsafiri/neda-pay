'use client';

import { useEffect, useState } from 'react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { PinVerificationModal } from './PinVerificationModal';
import { isSessionTimedOut, updateSessionActivity } from '@/utils/deviceAuth';

export function SessionTimeoutHandler() {
  const { walletAddress, isWalletAuthenticated } = useWalletAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Check for session timeout periodically
  useEffect(() => {
    if (!isWalletAuthenticated || !walletAddress) return;
    
    // Check for session timeout immediately
    if (isSessionTimedOut()) {
      setShowPinModal(true);
    }
    
    // Set up interval to check for session timeout
    const intervalId = setInterval(() => {
      if (isSessionTimedOut()) {
        setShowPinModal(true);
      }
    }, 60000); // Check every minute
    
    // Update activity on user interactions
    const handleUserActivity = () => {
      if (isWalletAuthenticated && !showPinModal) {
        updateSessionActivity();
      }
    };
    
    // Add event listeners for user activity
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
    };
  }, [isWalletAuthenticated, walletAddress, showPinModal]);
  
  // Handle successful PIN verification
  const handlePinSuccess = () => {
    setShowPinModal(false);
  };
  
  // Only render if wallet is authenticated
  if (!isWalletAuthenticated || !walletAddress) {
    return null;
  }
  
  return (
    <>
      {showPinModal && (
        <PinVerificationModal
          isOpen={showPinModal}
          onClose={() => {}} // Don't allow closing without verification
          onSuccess={handlePinSuccess}
          walletAddress={walletAddress}
          isSessionExpired={true}
        />
      )}
    </>
  );
}
