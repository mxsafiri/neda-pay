'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, Upload, ChevronDown } from 'lucide-react';
// Biometric capture removed as per requirements
import { VerificationResults } from './VerificationResults';
import { WalletCreation } from './WalletCreation';
import { uploadKycDocument } from '@/lib/kyc-storage';
import { 
  validateDocument, 
  // verifyFacialMatch removed - no longer needed for document-only flow
  calculateRiskScore,
  determineKycStatus,
  DocumentValidationResult
} from '@/lib/kyc-verification';
import { KycStatus } from '@/types/kyc';

// Define the form schema with Zod
const kycFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date (YYYY-MM-DD)' }),
  nationality: z.string().min(2, { message: 'Please select your nationality' }),
  idType: z.enum(['passport', 'nationalId'], { 
    required_error: 'Please select an ID type' 
  }),
  idNumber: z.string().min(4, { message: 'ID number must be at least 4 characters' }),
  // Selfie verification is handled separately with the BiometricCapture component
});

// TypeScript type derived from the schema
type KYCFormData = z.infer<typeof kycFormSchema>;

interface KYCFormProps {
  onComplete?: () => void;
  userId: string;
}

export function KYCForm({ onComplete, userId }: KYCFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [currentStep, setCurrentStep] = useState<'info' | 'document' | 'review' | 'verification' | 'wallet' | 'result'>('info');
  const [formData, setFormData] = useState<KYCFormData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Verification results
  const [documentResult, setDocumentResult] = useState<DocumentValidationResult | null>(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  // const [verificationError, setVerificationError] = useState('');
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      idType: 'passport',
    },
  });

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }
      
      // Check file type (PDF, JPG, PNG)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      
      setUploadedFile(file);
      setUploadError('');
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
  };

  // Handle initial form submission (personal info)
  const onSubmit = async (data: KYCFormData) => {
    // Save form data and move to document upload step
    setFormData(data);
    setCurrentStep('document');
  };
  
  // Handle document upload step completion
  const handleDocumentStepComplete = () => {
    if (!uploadedFile) {
      setUploadError('Please upload your ID document');
      return;
    }
    
    // Move directly to review step (selfie step removed)
    setCurrentStep('review');
  };
  
  // Selfie capture removed as per requirements
  
  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!formData || !uploadedFile) {
      setUploadError('Please complete all steps before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setUploadError('');
    setVerificationInProgress(true);
    setCurrentStep('verification');
    
    try {
      console.log('Starting KYC submission process...');
      
      // Upload the document to Supabase Storage
      console.log('Uploading document...');
      const documentUrl = await uploadKycDocument(userId);
      console.log('Document uploaded successfully:', documentUrl);
      
      // Perform document validation
      console.log('Validating document...');
      const docResult = await validateDocument(
        documentUrl,
        formData.idType
      );
      setDocumentResult(docResult);
      console.log('Document validation result:', docResult);
      
      // Document-only flow - no facial verification needed
      
      // Calculate risk score based on document only
      if (docResult) {
        // Create a default successful verification result for document-only flow
        const defaultVerificationResult = {
          isMatch: true,
          confidence: 100,
          livenessScore: 100,
          isLive: true,
          errors: []
        };
        
        const calculatedRiskScore = calculateRiskScore(docResult, defaultVerificationResult);
        setRiskScore(calculatedRiskScore);
        console.log('Risk score:', calculatedRiskScore);
        
        // Determine KYC status
        const status = determineKycStatus(docResult, defaultVerificationResult, calculatedRiskScore);
        setKycStatus(status);
        console.log('KYC status:', status);
      }
      
      // Submit the KYC data to the API
      console.log('Submitting KYC data...');
      console.log('Payload:', {
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        idType: formData.idType,
        idNumber: formData.idNumber,
        documentUrl,
        documentValidation: documentResult,
        riskScore,
        kycStatus
      });
      
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          idType: formData.idType,
          idNumber: formData.idNumber,
          documentUrl,
          documentValidation: documentResult,
          riskScore,
          kycStatus
        }),
      });
      
      const result = await response.json();
      console.log('API response:', result);
      
      if (!response.ok) {
        console.error('API error details:', result);
        throw new Error(result.message || result.error || 'Failed to submit KYC data');
      }
      
      console.log('KYC data submitted successfully:', result);
      
      // Move to wallet creation step instead of completing immediately
      setCurrentStep('wallet');
    } catch (error) {
      console.error('Error submitting KYC data:', error);
      let errorMessage = 'Failed to submit KYC data';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      setUploadError(`Error processing KYC submission: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle wallet creation completion
  const handleWalletCreationComplete = (address: string) => {
    setWalletAddress(address);
    setIsComplete(true);
    if (onComplete) onComplete();
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center"
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Setup Complete</h3>
          <p className="text-white/70 mb-6">
            Your identity has been verified and your wallet has been created successfully.
          </p>
          <div className="text-sm text-white/50 px-6 py-3 bg-white/5 rounded-lg">
            Wallet Address: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Created'}
          </div>
        </div>
      </motion.div>
    );
  }

  // Render progress indicator
  const renderProgressSteps = () => {
    const steps = [
      { id: 'info', label: 'Personal Info' },
      { id: 'document', label: 'ID Document' },
      { id: 'review', label: 'Review' },
      { id: 'wallet', label: 'Wallet Setup' }
    ];
    
    return (
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = (
            (step.id === 'info' && formData) ||
            (step.id === 'document' && uploadedFile) ||
            false
          );
          
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              <div className="flex items-center">
                {index > 0 && (
                  <div className={`h-0.5 w-10 -ml-5 ${isCompleted ? 'bg-blue-500' : 'bg-white/20'}`} />
                )}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isActive ? 'bg-blue-500' : isCompleted ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-10 -mr-5 ${isCompleted ? 'bg-blue-500' : 'bg-white/20'}`} />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-white/50'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4">Identity Verification</h3>
      <p className="text-white/70 mb-6">
        To comply with regulations, we need to verify your identity. Please complete all steps.
      </p>
      
      {currentStep !== 'verification' && renderProgressSteps()}
      
      {currentStep === 'info' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-white/70 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-white/70 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-white/70 mb-1">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth.message}</p>
          )}
        </div>
        
        {/* Nationality */}
        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-white/70 mb-1">
            Nationality
          </label>
          <div className="relative">
            <select
              id="nationality"
              {...register('nationality')}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none text-white pr-10"
            >
              <option value="" className="bg-[#0A1F44] text-white">Select your nationality</option>
              <option value="US" className="bg-[#0A1F44] text-white">United States</option>
              <option value="UK" className="bg-[#0A1F44] text-white">United Kingdom</option>
              <option value="CA" className="bg-[#0A1F44] text-white">Canada</option>
              <option value="AU" className="bg-[#0A1F44] text-white">Australia</option>
              <option value="DE" className="bg-[#0A1F44] text-white">Germany</option>
              <option value="FR" className="bg-[#0A1F44] text-white">France</option>
              <option value="JP" className="bg-[#0A1F44] text-white">Japan</option>
              <option value="SG" className="bg-[#0A1F44] text-white">Singapore</option>
              <option value="AE" className="bg-[#0A1F44] text-white">United Arab Emirates</option>
              <option value="other" className="bg-[#0A1F44] text-white">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-white/70" />
            </div>
          </div>
          {errors.nationality && (
            <p className="mt-1 text-sm text-red-400">{errors.nationality.message}</p>
          )}
        </div>
        
        {/* ID Type */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            ID Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="passport"
                {...register('idType')}
                className="mr-2 accent-primary"
              />
              <span className="text-white">Passport</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="nationalId"
                {...register('idType')}
                className="mr-2 accent-primary"
              />
              <span className="text-white">National ID</span>
            </label>
          </div>
          {errors.idType && (
            <p className="mt-1 text-sm text-red-400">{errors.idType.message}</p>
          )}
        </div>
        
        {/* ID Number */}
        <div>
          <label htmlFor="idNumber" className="block text-sm font-medium text-white/70 mb-1">
            ID Number
          </label>
          <input
            id="idNumber"
            type="text"
            {...register('idNumber')}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.idNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.idNumber.message}</p>
          )}
        </div>
        
        {/* Next Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 p-4 mt-4 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-white font-medium"
        >
          Continue to Document Upload
        </button>
      </form>
      )}

      {currentStep === 'document' && (
        <div className="space-y-4">
          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Upload ID Document (PDF, JPG, PNG, max 5MB)
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
              <input
                type="file"
                id="idDocument"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="idDocument"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                {!uploadedFile ? (
                  <>
                    <Upload className="w-8 h-8 text-white/50 mb-2" />
                    <p className="text-white/70">Click to upload your document</p>
                    <p className="text-white/50 text-sm mt-1">
                      Passport or National ID card
                    </p>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center mb-2">
                      <div className="bg-white/10 rounded-full p-2 mr-3">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-white truncate">
                        {uploadedFile.name}
                      </span>
                      <span className="text-white/50 text-sm">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    {uploadProgress === 100 && (
                      <div className="flex items-center justify-center mt-2 text-green-400">
                        <Check className="w-4 h-4 mr-1" /> Upload complete
                      </div>
                    )}
                  </div>
                )}
              </label>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep('info')}
              className="flex-1 p-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleDocumentStepComplete}
              disabled={!uploadedFile}
              className="flex-1 p-3 bg-primary hover:bg-primary/90 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Review
            </button>
          </div>
          
          {uploadError && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {uploadError}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selfie verification step removed as per requirements */}

      {currentStep === 'review' && formData && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Review Your Information</h4>
          <p className="text-white/70 mb-4">
            Please review your information before final submission.
          </p>
          
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-white/50 text-sm">First Name</p>
                <p>{formData.firstName}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">Last Name</p>
                <p>{formData.lastName}</p>
              </div>
            </div>
            
            <div>
              <p className="text-white/50 text-sm">Date of Birth</p>
              <p>{formData.dateOfBirth}</p>
            </div>
            
            <div>
              <p className="text-white/50 text-sm">Nationality</p>
              <p>{formData.nationality}</p>
            </div>
            
            <div>
              <p className="text-white/50 text-sm">ID Type</p>
              <p>{formData.idType === 'passport' ? 'Passport' : 'National ID'}</p>
            </div>
            
            <div>
              <p className="text-white/50 text-sm">ID Number</p>
              <p>{formData.idNumber}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/50 text-sm mb-1">ID Document</p>
              {uploadedFile && (
                <div className="bg-white/5 rounded-lg p-3 flex items-center">
                  <div className="bg-white/10 rounded-full p-2 mr-3">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate">{uploadedFile.name}</p>
                    <p className="text-white/50 text-xs">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Selfie verification section removed */}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentStep('document')}
              className="flex-1 p-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 p-3 bg-primary hover:bg-primary/90 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Verification'
              )}
            </button>
          </div>
          
          {uploadError && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {uploadError}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Verification Results Step */}
      {currentStep === 'verification' && (
        <VerificationResults
          isLoading={verificationInProgress && !documentResult}
          documentResult={documentResult}
          riskScore={riskScore}
          kycStatus={kycStatus}
          onComplete={() => setCurrentStep('wallet')}
          onBack={() => setCurrentStep('review')}
        />
      )}
      
      {/* Wallet Creation Step */}
      {currentStep === 'wallet' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Create Your Wallet</h3>
            <p className="text-white/70">
              Now that your identity has been verified, let&apos;s create your wallet to manage your digital assets.
            </p>
          </div>
          
          <WalletCreation 
            userId={userId} 
            userName={formData ? `${formData.firstName} ${formData.lastName}` : userId}
            onComplete={handleWalletCreationComplete}
          />
        </div>
      )}
    </motion.div>
  );
}
