'use client';

import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { 
  DocumentValidationResult
} from '@/lib/kyc-verification';
import { KycStatus } from '@/types/kyc';

interface VerificationResultsProps {
  isLoading: boolean;
  documentResult: DocumentValidationResult | null;
  riskScore: number | null;
  kycStatus: KycStatus | null;
  onComplete: () => void;
  onBack: () => void;
}

export function VerificationResults({
  isLoading,
  documentResult,
  riskScore,
  kycStatus,
  onComplete,
  onBack
}: VerificationResultsProps) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium">Verification in Progress</h4>
      <p className="text-white/70 mb-4">
        We&apos;re verifying your identity. This may take a moment.
      </p>
      
      {isLoading && !documentResult && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-white/70">Processing your verification...</p>
        </div>
      )}
      
      {/* Document Verification Results */}
      {documentResult && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-full mr-3 ${documentResult.isValid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {documentResult.isValid ? (
                <ShieldCheck className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <h5 className="font-medium">Document Verification</h5>
              <p className="text-sm text-white/70">
                {documentResult.isValid ? 
                  'Your document has been verified successfully.' : 
                  'There was an issue with your document.'}
              </p>
            </div>
          </div>
          
          {documentResult.isValid && documentResult.extractedData && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-sm text-white/50 mb-1">Extracted Information:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {documentResult.extractedData.fullName && (
                  <div>
                    <span className="text-white/50">Name: </span>
                    <span>{documentResult.extractedData.fullName}</span>
                  </div>
                )}
                {documentResult.extractedData.documentNumber && (
                  <div>
                    <span className="text-white/50">Document #: </span>
                    <span>{documentResult.extractedData.documentNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!documentResult.isValid && documentResult.errors.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-sm text-red-400 mb-1">Issues found:</p>
              <ul className="list-disc list-inside text-sm text-white/70">
                {documentResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Facial Verification section removed - no longer needed for document-only flow */}
      
      {/* Risk Score and Status */}
      {riskScore !== null && kycStatus && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium">Verification Result</h5>
            <div className={`px-3 py-1 rounded-full text-sm ${kycStatus === KycStatus.APPROVED ? 'bg-green-500/20 text-green-400' : kycStatus === KycStatus.PENDING ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
              {kycStatus === KycStatus.APPROVED ? 'Approved' : kycStatus === KycStatus.PENDING ? 'Pending Review' : 'Rejected'}
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-white/50 mb-1">Risk Assessment:</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${riskScore < 20 ? 'bg-green-500' : riskScore < 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${riskScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-green-400">Low Risk</span>
              <span className="text-yellow-400">Medium Risk</span>
              <span className="text-red-400">High Risk</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            {kycStatus === KycStatus.APPROVED ? (
              <p className="text-green-400">Your identity has been verified successfully!</p>
            ) : kycStatus === KycStatus.PENDING ? (
              <p className="text-yellow-400">Your verification requires manual review. We&apos;ll notify you once it&apos;s complete.</p>
            ) : (
              <p className="text-red-400">Your verification was not successful. Please try again with clearer documents.</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-center mt-6">
        {kycStatus ? (
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg text-white transition-colors"
          >
            {kycStatus === KycStatus.APPROVED ? 'Continue to Wallet' : 'Back to Settings'}
          </button>
        ) : (
          <button
            onClick={onBack}
            className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            Back to Review
          </button>
        )}
      </div>
    </div>
  );
}
