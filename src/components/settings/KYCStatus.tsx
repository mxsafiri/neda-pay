'use client';

import { useKycStatus, getKycStatusMessage, canSubmitOrUpdateKyc } from '@/hooks/useKycStatus';
import { KycStatus as KycStatusEnum } from '@/types/kyc';
import { Check, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface KYCStatusProps {
  userId: string;
  showDetails?: boolean;
  onUpdateClick?: () => void;
}

export function KYCStatus({ userId, showDetails = true, onUpdateClick }: KYCStatusProps) {
  const { verification, isLoading, error, refetch } = useKycStatus(userId);
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-white/70">
        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full"></div>
        <span>Loading verification status...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-400">
        <AlertCircle className="w-4 h-4" />
        <span>Error: {error}</span>
        <button 
          onClick={() => refetch()} 
          className="text-primary hover:text-primary/80 flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }
  
  const statusMessage = getKycStatusMessage(verification?.status);
  const canUpdate = canSubmitOrUpdateKyc(verification);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {!verification && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>Not verified</span>
          </div>
        )}
        
        {verification?.status === KycStatusEnum.PENDING && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <Clock className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
        
        {verification?.status === KycStatusEnum.APPROVED && (
          <div className="flex items-center space-x-2 text-green-400">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
        
        {verification?.status === KycStatusEnum.REJECTED && (
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
        
        {canUpdate && onUpdateClick && (
          <button 
            onClick={onUpdateClick} 
            className="ml-2 text-primary hover:text-primary/80 text-sm"
          >
            {verification?.status === KycStatusEnum.REJECTED ? 'Update verification' : 'Verify now'}
          </button>
        )}
      </div>
      
      {showDetails && verification && (
        <div className="text-sm text-white/70 space-y-1 mt-2">
          {verification.status === KycStatusEnum.REJECTED && verification.reviewerNotes && (
            <div className="p-2 bg-red-400/10 rounded-md text-red-300 mb-2">
              <strong>Reason:</strong> {verification.reviewerNotes}
            </div>
          )}
          
          <div>
            <span className="text-white/50">Name:</span>{' '}
            {verification.firstName} {verification.lastName}
          </div>
          
          <div>
            <span className="text-white/50">ID Type:</span>{' '}
            {verification.idType === 'passport' ? 'Passport' : 'National ID'}
          </div>
          
          <div>
            <span className="text-white/50">Submitted:</span>{' '}
            {new Date(verification.createdAt).toLocaleDateString()}
          </div>
          
          {verification.status === KycStatusEnum.APPROVED && verification.reviewedAt && (
            <div>
              <span className="text-white/50">Approved:</span>{' '}
              {new Date(verification.reviewedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
