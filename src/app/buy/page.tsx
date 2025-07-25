'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle, CreditCard, Smartphone, Building, ChevronDown } from 'lucide-react';

// Define deposit provider types
type DepositProvider = {
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

// Available deposit providers
const depositProviders: DepositProvider[] = [
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: Building,
    fields: [
      {
        id: 'accountName',
        name: 'Your Bank Account Name',
        type: 'text',
        placeholder: 'Enter your account name',
      },
      {
        id: 'bankName',
        name: 'Your Bank Name',
        type: 'text',
        placeholder: 'Enter your bank name',
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
        name: 'Your Mobile Money Number',
        type: 'tel',
        placeholder: '+255 XXX XXX XXX',
        validation: /^\+?\d{10,15}$/,
        errorMessage: 'Please enter a valid phone number',
      },
      {
        id: 'provider',
        name: 'Provider',
        type: 'select',
        placeholder: 'Select provider',
      },
    ],
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    fields: [
      {
        id: 'cardNumber',
        name: 'Card Number',
        type: 'text',
        placeholder: 'XXXX XXXX XXXX XXXX',
        validation: /^\d{16}$/,
        errorMessage: 'Please enter a valid 16-digit card number',
      },
      {
        id: 'cardName',
        name: 'Name on Card',
        type: 'text',
        placeholder: 'Enter name as shown on card',
      },
    ],
  },
];

export default function BuyPage() {
  const [amount, setAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<DepositProvider | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const selectProvider = (provider: DepositProvider) => {
    setSelectedProvider(provider);
    setShowProviderDropdown(false);
    // Reset form data when changing providers
    setFormData({});
  };

  const validateForm = () => {
    if (!selectedProvider) return false;
    if (!amount || parseFloat(amount) <= 0) return false;
    
    // Check if all required fields are filled and valid
    for (const field of selectedProvider.fields) {
      const value = formData[field.id] || '';
      if (!value) return false;
      
      // Validate field if it has validation regex
      if (field.validation && !field.validation.test(value)) {
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      // Here you would integrate with your on-ramp provider API based on the selected provider
      console.log('Processing deposit with provider:', selectedProvider?.name);
      console.log('Deposit amount:', amount);
      console.log('Form data:', formData);
      
      // For now, we'll simulate a successful transaction after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success state
      setSuccess(true);
      setAmount('');
      setFormData({});
    } catch (err) {
      setError('Failed to process deposit. Please try again.');
      console.error('On-ramp error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <WalletLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
        >
          <h1 className="text-2xl font-bold mb-6">Buy</h1>
          
          {success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400"
              >
                <CheckCircle size={32} />
              </motion.div>
              <h2 className="text-xl font-medium mb-2">Purchase Successful!</h2>
              <p className="text-gray-400 mb-6">
                Your purchase has been processed successfully.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
              >
                Buy Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Buy
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {/* Deposit Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {selectedProvider ? (
                      <div className="flex items-center gap-2">
                        {React.createElement(selectedProvider.icon, { size: 18 })}
                        <span>{selectedProvider.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Select payment method</span>
                    )}
                    <ChevronDown size={18} className={`transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showProviderDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-[#0A1F44] border border-white/10 rounded-lg shadow-lg overflow-hidden">
                      {depositProviders.map(provider => (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => selectProvider(provider)}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                        >
                          {React.createElement(provider.icon, { size: 18 })}
                          <span>{provider.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dynamic form fields based on selected provider */}
              {selectedProvider && (
                <div className="space-y-4">
                  {selectedProvider.fields.map(field => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-sm font-medium text-gray-300 mb-2">
                        {field.name}
                      </label>
                      <input
                        type={field.type}
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {field.validation && formData[field.id] && !field.validation.test(formData[field.id]) && (
                        <p className="mt-1 text-sm text-red-400">{field.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isProcessing || !validateForm()}
                className={`w-full py-4 rounded-full flex items-center justify-center gap-2 text-white text-lg font-medium transition-all ${
                  isProcessing || !validateForm()
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Buy Now</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <div className="text-xs text-gray-400 text-center">
                Purchases are typically processed within:
                <br />
                {selectedProvider?.id === 'bank' && '1-3 business days for bank transfers'}
                {selectedProvider?.id === 'mobile' && '5-30 minutes for mobile money'}
                {selectedProvider?.id === 'card' && '1-2 business days for card purchases'}
                {!selectedProvider && '5-30 minutes to 3 business days depending on method'}
                <br />
                A small processing fee may apply.
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </WalletLayout>
  );
}
