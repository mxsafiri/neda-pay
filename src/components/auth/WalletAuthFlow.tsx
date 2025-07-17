'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PinSetupModal } from './PinSetupModal';
import { PinVerificationModal } from './PinVerificationModal';
import { DeviceRecoveryModal } from './DeviceRecoveryModal';
import { useWalletAuth } from '@/hooks/useWalletAuth';

interface WalletAuthFlowProps {
  onComplete?: () => void;
}

export function WalletAuthFlow({ onComplete }: WalletAuthFlowProps) {
  const router = useRouter();
  const { 
    isWalletAuthenticated, 
    walletAddress, 
    isPinRequired, 
    isNewDevice,
    createWallet
  } = useWalletAuth();
  
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [showDeviceRecovery, setShowDeviceRecovery] = useState(false);
  
  // Check authentication state on mount
  useEffect(() => {
    if (isWalletAuthenticated) {
      if (isPinRequired) {
        setShowPinVerification(true);
      } else if (isNewDevice) {
        setShowDeviceRecovery(true);
      } else {
        // Already authenticated and on a recognized device
        if (onComplete) onComplete();
      }
    } else {
      // No wallet yet, show PIN setup for new wallet
      setShowPinSetup(true);
    }
  }, [isWalletAuthenticated, isPinRequired, isNewDevice, onComplete]);
  
  // Handle PIN setup completion
  const handlePinSetupComplete = async () => {
    setShowPinSetup(false);
    
    // Create wallet with the new PIN
    try {
      await createWallet();
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Failed to create wallet:', error);
      // Show error state
    }
  };
  
  // Handle PIN verification completion
  const handlePinVerificationComplete = () => {
    setShowPinVerification(false);
    if (onComplete) onComplete();
  };
  
  // Handle device recovery completion
  const handleDeviceRecoveryComplete = () => {
    setShowDeviceRecovery(false);
    if (onComplete) onComplete();
  };
  
  return (
    <>
      {/* PIN Setup for new wallet */}
      {showPinSetup && walletAddress && (
        <PinSetupModal
          isOpen={showPinSetup}
          onClose={() => router.push('/')}
          onComplete={handlePinSetupComplete}
          walletAddress={walletAddress}
        />
      )}
      
      {/* PIN Verification for existing wallet */}
      {showPinVerification && walletAddress && (
        <PinVerificationModal
          isOpen={showPinVerification}
          onClose={() => router.push('/')}
          onSuccess={handlePinVerificationComplete}
          walletAddress={walletAddress}
        />
      )}
      
      {/* Device Recovery for new devices */}
      {showDeviceRecovery && walletAddress && (
        <DeviceRecoveryModal
          isOpen={showDeviceRecovery}
          onClose={() => router.push('/')}
          onComplete={handleDeviceRecoveryComplete}
          walletAddress={walletAddress}
        />
      )}
    </>
  );
}
