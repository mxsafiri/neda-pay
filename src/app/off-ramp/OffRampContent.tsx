'use client';

import React, { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle, Smartphone, Building, ChevronDown } from 'lucide-react';

// Define withdrawal provider types
type WithdrawalProvider = {
  id: string;
  name: string;
  icon: React.ElementType;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    placeholder: string;
    validation?: RegExp;
    errorMessage?: string;
  }>;
};

// Available withdrawal providers
const withdrawalProviders: WithdrawalProvider[] = [
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: Building,
    fields: [
      {
        id: 'accountName',
        name: 'Account Name',
        type: 'text',
        placeholder: 'Enter account name',
        validation: /^[a-zA-Z\s]{3,50}$/,
        errorMessage: 'Please enter a valid account name (3-50 characters)',
      },
      {
        id: 'accountNumber',
        name: 'Account Number',
        type: 'text',
        placeholder: 'Enter account number',
        validation: /^\d{10,12}$/,
        errorMessage: 'Please enter a valid account number (10-12 digits)',
      },
      {
        id: 'bankName',
        name: 'Bank Name',
        type: 'text',
        placeholder: 'Enter bank name',
        validation: /^[a-zA-Z\s]{3,50}$/,
        errorMessage: 'Please enter a valid bank name (3-50 characters)',
      },
      {
        id: 'swiftCode',
        name: 'SWIFT/BIC Code',
        type: 'text',
        placeholder: 'Enter SWIFT/BIC code',
        validation: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
        errorMessage: 'Please enter a valid SWIFT/BIC code',
      },
      {
        id: 'amount',
        name: 'Amount (USD)',
        type: 'number',
        placeholder: 'Enter amount',
        validation: /^[1-9]\d*(\.\d{1,2})?$/,
        errorMessage: 'Please enter a valid amount',
      },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    icon: Smartphone,
    fields: [
      {
        id: 'phoneNumber',
        name: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter phone number',
        validation: /^\+?[0-9]{10,15}$/,
        errorMessage: 'Please enter a valid phone number',
      },
      {
        id: 'provider',
        name: 'Provider',
        type: 'text',
        placeholder: 'Enter provider name',
        validation: /^[a-zA-Z\s]{3,50}$/,
        errorMessage: 'Please enter a valid provider name',
      },
      {
        id: 'amount',
        name: 'Amount (USD)',
        type: 'number',
        placeholder: 'Enter amount',
        validation: /^[1-9]\d*(\.\d{1,2})?$/,
        errorMessage: 'Please enter a valid amount',
      },
    ],
  },
];

export default function OffRampContent() {
  const [selectedProvider, setSelectedProvider] = useState<WithdrawalProvider>(withdrawalProviders[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const validateField = (field: WithdrawalProvider['fields'][0], value: string): boolean => {
    if (!field.validation) return true;
    return field.validation.test(value);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    selectedProvider.fields.forEach(field => {
      const value = formData[field.id] || '';
      if (!validateField(field, value)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors in the form');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful withdrawal
      setSuccess(true);
      setIsProcessing(false);
    } catch {
      setError('An error occurred while processing your withdrawal');
      setIsProcessing(false);
    }
  };

  const handleSelectProvider = (provider: WithdrawalProvider) => {
    setSelectedProvider(provider);
    setShowProviderDropdown(false);
    // Reset form data when changing providers
    setFormData({});
  };

  return (
    <WalletLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Cash Out</h1>
        
        {success ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-500 w-16 h-16" />
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Withdrawal Request Submitted</h2>
            <p className="text-green-700 mb-6">
              Your withdrawal request has been submitted successfully. You will receive your funds within 1-3 business days.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Make Another Withdrawal
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Method
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                  className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center">
                    <span className="mr-3">
                      {React.createElement(selectedProvider.icon, { className: "w-5 h-5 text-gray-600" })}
                    </span>
                    <span>{selectedProvider.name}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showProviderDropdown ? 'transform rotate-180' : ''}`} />
                </button>
                
                {showProviderDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {withdrawalProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => handleSelectProvider(provider)}
                        className={`w-full flex items-center p-3 hover:bg-gray-50 ${
                          provider.id === selectedProvider.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <span className="mr-3">
                          {React.createElement(provider.icon, { className: "w-5 h-5 text-gray-600" })}
                        </span>
                        <span>{provider.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {selectedProvider.fields.map((field) => {
                const value = formData[field.id] || '';
                const isValid = !value || validateField(field, value);
                
                return (
                  <div key={field.id} className="mb-4">
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      value={value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full p-3 border ${
                        isValid ? 'border-gray-300' : 'border-red-500'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {!isValid && (
                      <p className="mt-1 text-sm text-red-600">{field.errorMessage}</p>
                    )}
                  </div>
                );
              })}
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Withdraw Funds <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </WalletLayout>
  );
}
