'use client';

import { useState, useEffect } from 'react';
import { KycVerification, KycStatus } from '@/types/kyc';

interface UseKycStatusResult {
  verification: KycVerification | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage KYC verification status for a user
 * @param userId The user ID to fetch KYC status for
 * @returns Object containing verification data, loading state, error, and refetch function
 */
export function useKycStatus(userId: string): UseKycStatusResult {
  const [verification, setVerification] = useState<KycVerification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKycStatus = async () => {
    if (!userId) {
      setError('User ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/kyc/status?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch KYC status');
      }

      setVerification(data.verification);
    } catch (err) {
      console.error('Error fetching KYC status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KYC status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [userId]);

  return {
    verification,
    isLoading,
    error,
    refetch: fetchKycStatus,
  };
}

/**
 * Helper function to get a human-readable status message from KYC status
 * @param status The KYC status
 * @returns Human-readable status message
 */
export function getKycStatusMessage(status: KycStatus | null | undefined): string {
  if (!status) return 'Not submitted';

  switch (status) {
    case KycStatus.PENDING:
      return 'Verification pending';
    case KycStatus.APPROVED:
      return 'Verified';
    case KycStatus.REJECTED:
      return 'Verification rejected';
    default:
      return 'Unknown status';
  }
}

/**
 * Helper function to determine if a user can submit or update KYC information
 * @param verification The KYC verification object
 * @returns Boolean indicating if the user can submit or update KYC
 */
export function canSubmitOrUpdateKyc(verification: KycVerification | null): boolean {
  if (!verification) return true; // No verification yet, can submit
  return verification.status === KycStatus.REJECTED; // Can update if rejected
}
