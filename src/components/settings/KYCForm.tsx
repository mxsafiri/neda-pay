'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Check, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

// Define the KYC schema with Zod for validation
const kycSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date (YYYY-MM-DD)' }),
  nationality: z.string().min(2, { message: 'Please select your nationality' }),
  idType: z.enum(['passport', 'nationalId'], { 
    required_error: 'Please select an ID type' 
  }),
  idNumber: z.string().min(4, { message: 'ID number must be at least 4 characters' }),
});

// TypeScript type derived from the schema
type KYCFormData = z.infer<typeof kycSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
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

  // Handle form submission
  const onSubmit = async (data: KYCFormData) => {
    if (!uploadedFile) {
      setUploadError('Please upload your ID document');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would upload the data and file to your backend
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log('KYC data submitted:', { ...data, userId });
      setIsComplete(true);
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error submitting KYC data:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          <h3 className="text-xl font-bold mb-2">Verification Submitted</h3>
          <p className="text-white/70 mb-6">
            Your identity verification is being processed. We&apos;ll notify you once it&apos;s complete.
          </p>
          <div className="text-sm text-white/50 px-6 py-3 bg-white/5 rounded-lg">
            Verification ID: {userId.slice(0, 8)}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
    >
      <h3 className="text-xl font-bold mb-4">Identity Verification</h3>
      <p className="text-white/70 mb-6">
        To comply with regulations, we need to verify your identity. Please provide the following information.
      </p>
      
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 truncate max-w-[200px]">
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
          {uploadError && (
            <div className="flex items-center mt-2 text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 p-4 mt-4 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Verification'
          )}
        </button>
      </form>
    </motion.div>
  );
}
