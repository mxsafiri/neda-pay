/**
 * KYC Verification Utilities
 * 
 * This module provides utilities for KYC verification including:
 * - Document validation
 * - Risk scoring
 */

import { KycStatus } from '@/types/kyc';

/**
 * Interface for document validation result
 */
export interface DocumentValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  documentType?: 'passport' | 'nationalId' | 'unknown';
  extractedData?: {
    fullName?: string;
    documentNumber?: string;
    dateOfBirth?: string;
    nationality?: string;
    expiryDate?: string;
  };
}

// FacialVerificationResult interface removed - no longer needed for document-only flow

/**
 * Validates an ID document image
 * In a production environment, this would call an actual document verification API
 */
export async function validateDocument(
  documentImage: string | File,
  documentType: 'passport' | 'nationalId'
): Promise<DocumentValidationResult> {
  // In a real implementation, this would call a document verification API
  // For demo purposes, we'll simulate a validation process
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate document validation with 80% success rate
  const isValid = Math.random() > 0.2;
  
  if (!isValid) {
    return {
      isValid: false,
      confidence: Math.random() * 0.5, // Low confidence
      errors: [
        'Document could not be verified',
        'Please upload a clearer image'
      ]
    };
  }
  
  // Simulate successful validation
  return {
    isValid: true,
    confidence: 0.8 + (Math.random() * 0.2), // High confidence
    errors: [],
    documentType,
    extractedData: {
      fullName: 'EXTRACTED NAME', // In real implementation, this would be OCR'd from the document
      documentNumber: 'EXTRACTED' + Math.floor(Math.random() * 1000000).toString(),
      dateOfBirth: '1990-01-01', // Simulated
      nationality: documentType === 'passport' ? 'TZS' : undefined,
      expiryDate: '2030-01-01', // Simulated
    }
  };
}

// verifyFacialMatch function removed - no longer needed for document-only flow

// detectLiveness function removed - no longer needed for document-only flow

/**
 * Calculate risk score based on document validation results
 * Returns a score from 0 (lowest risk) to 100 (highest risk)
 */
export function calculateRiskScore(
  documentValidation: DocumentValidationResult,
  facialVerification: {
    isMatch: boolean;
    confidence: number;
    livenessScore: number;
    isLive: boolean;
    errors: string[];
  }
): number {
  let riskScore = 50; // Start at medium risk
  
  // Document validation factors
  if (documentValidation.isValid) {
    riskScore -= 20; // Valid document reduces risk
    riskScore -= documentValidation.confidence * 10; // Higher confidence reduces risk
  } else {
    riskScore += 30; // Invalid document increases risk
  }
  
  // Facial verification factors
  if (facialVerification.isMatch) {
    riskScore -= 15; // Matching face reduces risk
    riskScore -= facialVerification.confidence * 10; // Higher confidence reduces risk
  } else {
    riskScore += 25; // Non-matching face increases risk
  }
  
  // Liveness factors
  if (facialVerification.isLive) {
    riskScore -= 15; // Live person reduces risk
    riskScore -= facialVerification.livenessScore * 10; // Higher liveness score reduces risk
  } else {
    riskScore += 40; // Potential spoofing attempt greatly increases risk
  }
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, riskScore));
}

/**
 * Determine KYC status based on verification results and risk score
 */
export function determineKycStatus(
  documentValidation: DocumentValidationResult,
  facialVerification: {
    isMatch: boolean;
    confidence: number;
    livenessScore: number;
    isLive: boolean;
    errors: string[];
  },
  riskScore: number
): KycStatus {
  // Automatic rejection criteria
  if (!documentValidation.isValid) {
    return KycStatus.REJECTED;
  }
  
  if (!facialVerification.isMatch || !facialVerification.isLive) {
    return KycStatus.REJECTED;
  }
  
  // Risk-based approval
  if (riskScore < 20) {
    return KycStatus.APPROVED; // Low risk, automatic approval
  } else if (riskScore < 50) {
    return KycStatus.PENDING; // Medium risk, manual review
  } else {
    return KycStatus.REJECTED; // High risk, automatic rejection
  }
}
