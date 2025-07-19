'use client';

import React, { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle, Smartphone, Building, ChevronDown } from 'lucide-react';
import { useTheme, financeTheme } from '@/contexts/ThemeContext';

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
        placeholder: 'Enter account holder name',
        validation: /^[a-zA-Z\s]{3,50}$/,
        errorMessage: 'Please enter a valid name (3-50 characters)',
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
        validation: /^[a-zA-Z\s]{2,50}$/,
        errorMessage: 'Please enter a valid bank name',
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
        name: 'Amount (USDC)',
        type: 'number',
        placeholder: 'Enter amount to withdraw',
        validation: /^\d+(\.\d{1,2})?$/,
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
        placeholder: 'Enter mobile money number',
        validation: /^\+?[0-9]{10,15}$/,
        errorMessage: 'Please enter a valid phone number',
      },
      {
        id: 'fullName',
        name: 'Full Name',
        type: 'text',
        placeholder: 'Enter full name',
        validation: /^[a-zA-Z\s]{3,50}$/,
        errorMessage: 'Please enter a valid name (3-50 characters)',
      },
      {
        id: 'provider',
        name: 'Mobile Money Provider',
        type: 'text',
        placeholder: 'e.g., M-Pesa, MTN Mobile Money',
        validation: /^[a-zA-Z\s\-]{2,30}$/,
        errorMessage: 'Please enter a valid provider name',
      },
      {
        id: 'amount',
        name: 'Amount (USDC)',
        type: 'number',
        placeholder: 'Enter amount to withdraw',
        validation: /^\d+(\.\d{1,2})?$/,
        errorMessage: 'Please enter a valid amount',
      },
    ],
  },
];

export default function OffRampPage() {
  const { theme } = useTheme();
  const themeColors = financeTheme[theme];
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
      
      // Success
      setSuccess(true);
      setIsProcessing(false);
    } catch {
      setError('Failed to process withdrawal. Please try again.');
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setSuccess(false);
    setError(null);
  };

  return (
    <WalletLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 
          className="text-2xl font-bold mb-6"
          style={{ color: themeColors.text.primary }}
        >
          Cash Out
        </h1>
        
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-6 mb-6 transition-colors duration-200"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
              borderColor: themeColors.brand.success,
              border: `1px solid ${themeColors.brand.success}`
            }}
          >
            <div className="flex items-center mb-4">
              <CheckCircle 
                className="mr-3 h-6 w-6" 
                style={{ color: themeColors.brand.success }}
              />
              <h2 
                className="text-xl font-semibold"
                style={{ color: themeColors.text.primary }}
              >
                Withdrawal Request Submitted
              </h2>
            </div>
            <p 
              className="mb-4"
              style={{ color: themeColors.text.secondary }}
            >
              Your withdrawal request has been successfully submitted. You will receive your funds within 1-3 business days.
            </p>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: themeColors.brand.primary,
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1d4ed8' : '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.brand.primary;
              }}
            >
              Make Another Withdrawal
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div 
              className="rounded-lg p-6 mb-6 border transition-colors duration-200"
              style={{
                backgroundColor: themeColors.background.card,
                borderColor: themeColors.border.primary
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: themeColors.text.primary }}
              >
                Withdraw Funds
              </h2>
              
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: themeColors.text.primary }}
                >
                  Withdrawal Method
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                    className="w-full flex items-center justify-between p-3 border rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: themeColors.background.tertiary,
                      borderColor: themeColors.border.primary,
                      color: themeColors.text.primary
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{
                          backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
                        }}
                      >
                        {React.createElement(selectedProvider.icon, { 
                          className: "h-4 w-4",
                          style: { color: themeColors.brand.primary }
                        })}
                      </div>
                      <span>{selectedProvider.name}</span>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`}
                      style={{ color: themeColors.text.secondary }}
                    />
                  </button>
                  
                  {showProviderDropdown && (
                    <div 
                      className="absolute z-10 mt-1 w-full border rounded-lg shadow-lg transition-colors duration-200"
                      style={{
                        backgroundColor: themeColors.background.card,
                        borderColor: themeColors.border.primary
                      }}
                    >
                      {withdrawalProviders.map(provider => (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowProviderDropdown(false);
                          }}
                          className="w-full flex items-center p-3 transition-colors"
                          style={{ color: themeColors.text.primary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                            style={{
                              backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
                            }}
                          >
                            {React.createElement(provider.icon, { 
                              className: "h-4 w-4",
                              style: { color: themeColors.brand.primary }
                            })}
                          </div>
                          <span>{provider.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center">
                    <AlertCircle className="text-red-500 mr-2 h-5 w-5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {selectedProvider.fields.map(field => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-sm font-medium mb-1">
                        {field.name}
                      </label>
                      <input
                        type={field.type}
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`w-full p-3 bg-slate-800 border ${
                          formData[field.id] && !validateField(field, formData[field.id])
                            ? 'border-red-500'
                            : 'border-slate-700'
                        } rounded-lg focus:outline-none focus:ring-1 focus:ring-primary`}
                      />
                      {formData[field.id] && !validateField(field, formData[field.id]) && (
                        <p className="mt-1 text-sm text-red-400">{field.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full p-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Withdraw Funds <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </WalletLayout>
  );
}
