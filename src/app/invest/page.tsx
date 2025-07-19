'use client';

// Prevent Next.js from prerendering this page
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { ArrowLeft, TrendingUp, Info, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/useWalletStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, financeTheme } from '@/contexts/ThemeContext';
// import Image from 'next/image';

// Mock data for index funds
const indexFunds = [
  {
    id: 'neda-index-1',
    name: 'NEDA Growth Index',
    description: 'Diversified basket of high-growth local assets',
    apy: 8.5,
    risk: 'Medium',
    minAmount: 100,
    currency: 'TZS',
    icon: '/icons/growth-chart.svg',
    color: 'from-blue-600 to-purple-500'
  },
  {
    id: 'neda-index-2',
    name: 'NEDA Stable Income',
    description: 'Conservative portfolio focused on stable returns',
    apy: 5.2,
    risk: 'Low',
    minAmount: 50,
    currency: 'TZS',
    icon: '/icons/shield-check.svg',
    color: 'from-green-600 to-teal-500'
  },
  {
    id: 'neda-index-3',
    name: 'NEDA Market Index',
    description: 'Tracks performance of top local businesses',
    apy: 7.1,
    risk: 'Medium-High',
    minAmount: 200,
    currency: 'TZS',
    icon: '/icons/chart-bar.svg',
    color: 'from-yellow-500 to-orange-500'
  }
];

// Mock data for user's invested positions
const initialInvestedPositions = [
  {
    id: 'invest-1',
    fundId: 'neda-index-1',
    amount: 500,
    startDate: new Date(2025, 6, 1), // July 1, 2025
    endDate: new Date(2025, 9, 1),   // October 1, 2025
    estimatedReward: 10.62,
    status: 'active'
  }
];

export default function InvestPage() {
  const router = useRouter();
  const { /* authenticated */ } = useAuth();
  const { balances } = useWalletStore();
  const { theme } = useTheme();
  const themeColors = financeTheme[theme];
  
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [investDuration, setInvestDuration] = useState(3); // months
  const [investedPositions, setInvestedPositions] = useState(initialInvestedPositions);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'funds' | 'positions'>('funds');
  
  // Get current balance for TZS
  const tzsBalance = balances.find(b => b.symbol === 'TZS')?.balance || '0';
  
  // Calculate estimated returns
  const calculateReturns = (amount: number, apy: number, months: number) => {
    return (amount * (apy / 100) * (months / 12)).toFixed(2);
  };
  
  // Handle investment submission
  const handleInvest = () => {
    if (!selectedFund || !investAmount) return;
    
    const fund = indexFunds.find(f => f.id === selectedFund);
    if (!fund) return;
    
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  // Confirm investment
  const confirmInvest = () => {
    if (!selectedFund || !investAmount) return;
    
    const fund = indexFunds.find(f => f.id === selectedFund);
    if (!fund) return;
    
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Create new invested position
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + investDuration);
    
    const newPosition = {
      id: `invest-${Date.now()}`,
      fundId: selectedFund,
      amount: amount,
      startDate: startDate,
      endDate: endDate,
      estimatedReward: parseFloat(calculateReturns(amount, fund.apy, investDuration)),
      status: 'active'
    };
    
    // Add to invested positions
    setInvestedPositions([...investedPositions, newPosition]);
    
    // Reset form and close confirmation
    setSelectedFund(null);
    setInvestAmount('');
    setInvestDuration(3);
    setShowConfirmation(false);
    
    // Switch to positions tab
    setActiveTab('positions');
  };
  
  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <WalletLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: themeColors.text.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 
            className="text-2xl font-bold"
            style={{ color: themeColors.text.primary }}
          >
            Invest & Earn
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex rounded-xl p-1 transition-colors duration-200"
          style={{ backgroundColor: themeColors.background.tertiary }}
        >
          <button
            onClick={() => setActiveTab('funds')}
            className="flex-1 py-3 px-4 rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === 'funds' ? themeColors.brand.primary : 'transparent',
              color: activeTab === 'funds' ? '#ffffff' : themeColors.text.secondary
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'funds') {
                e.currentTarget.style.color = themeColors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'funds') {
                e.currentTarget.style.color = themeColors.text.secondary;
              }
            }}
          >
            Investment Funds
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className="flex-1 py-3 px-4 rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === 'positions' ? themeColors.brand.primary : 'transparent',
              color: activeTab === 'positions' ? '#ffffff' : themeColors.text.secondary
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'positions') {
                e.currentTarget.style.color = themeColors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'positions') {
                e.currentTarget.style.color = themeColors.text.secondary;
              }
            }}
          >
            My Investments
          </button>
        </motion.div>

        {/* Investment Funds Tab */}
        {activeTab === 'funds' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Available Funds */}
            <div className="space-y-4">
              <h2 
                className="text-xl font-semibold"
                style={{ color: themeColors.text.primary }}
              >
                Available Investment Funds
              </h2>
              {indexFunds.map((fund) => (
                <motion.div
                  key={fund.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl border-2 transition-all cursor-pointer"
                  style={{
                    borderColor: selectedFund === fund.id ? themeColors.brand.primary : themeColors.border.primary,
                    backgroundColor: selectedFund === fund.id 
                      ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                      : themeColors.background.card
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFund !== fund.id) {
                      e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFund !== fund.id) {
                      e.currentTarget.style.borderColor = themeColors.border.primary;
                    }
                  }}
                  onClick={() => setSelectedFund(fund.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${fund.color} flex items-center justify-center`}>
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 
                          className="font-semibold"
                          style={{ color: themeColors.text.primary }}
                        >
                          {fund.name}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: themeColors.text.secondary }}
                        >
                          {fund.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: themeColors.brand.success }}
                      >
                        {fund.apy}%
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: themeColors.text.secondary }}
                      >
                        APY
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span style={{ color: themeColors.text.secondary }}>
                      Risk Level: <span style={{ color: themeColors.text.primary }}>{fund.risk}</span>
                    </span>
                    <span style={{ color: themeColors.text.secondary }}>
                      Min Amount: <span style={{ color: themeColors.text.primary }}>{fund.minAmount} {fund.currency}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Investment Form */}
            {selectedFund && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-6 border transition-colors duration-200"
                style={{
                  backgroundColor: themeColors.background.card,
                  borderColor: themeColors.border.primary
                }}
              >
                <h3 
                  className="text-lg font-medium"
                  style={{ color: themeColors.text.primary }}
                >
                  Investment Details
                </h3>
                
                <div className="mt-4 space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: themeColors.text.primary }}
                    >
                      Investment Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full p-3 rounded-lg focus:outline-none transition-colors duration-200"
                        style={{
                          backgroundColor: themeColors.background.tertiary,
                          border: `1px solid ${themeColors.border.primary}`,
                          color: themeColors.text.primary
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = themeColors.brand.primary;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = themeColors.border.primary;
                        }}
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                      />
                      <div 
                        className="absolute right-3 top-3"
                        style={{ color: themeColors.text.secondary }}
                      >
                        TZS
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span style={{ color: themeColors.text.secondary }}>
                        Available: {tzsBalance} TZS
                      </span>
                      <button 
                        className="transition-colors"
                        style={{ color: themeColors.brand.primary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme === 'dark' ? '#60a5fa' : '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = themeColors.brand.primary;
                        }}
                        onClick={() => setInvestAmount(tzsBalance)}
                      >
                        Use Max
                      </button>
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: themeColors.text.primary }}
                    >
                      Investment Duration
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 6, 12, 24].map((months) => (
                        <button
                          key={months}
                          onClick={() => setInvestDuration(months)}
                          className="p-3 rounded-lg border transition-all"
                          style={{
                            borderColor: investDuration === months ? themeColors.brand.primary : themeColors.border.primary,
                            backgroundColor: investDuration === months 
                              ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                              : themeColors.background.tertiary,
                            color: investDuration === months ? themeColors.brand.primary : themeColors.text.primary
                          }}
                          onMouseEnter={(e) => {
                            if (investDuration !== months) {
                              e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (investDuration !== months) {
                              e.currentTarget.style.borderColor = themeColors.border.primary;
                            }
                          }}
                        >
                          {months}M
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Returns */}
                  {investAmount && parseFloat(investAmount) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-medium">Estimated Total Return</span>
                        <span className="text-xl font-bold text-green-400">
                          {(parseFloat(investAmount) + parseFloat(calculateReturns(
                            parseFloat(investAmount), 
                            indexFunds.find(f => f.id === selectedFund)?.apy || 0,
                            investDuration
                          ))).toFixed(2)} TZS
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Invest Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInvest}
                    disabled={
                      !investAmount || 
                      parseFloat(investAmount) <= 0 ||
                      parseFloat(investAmount) > parseFloat(tzsBalance) ||
                      parseFloat(investAmount) < (indexFunds.find(f => f.id === selectedFund)?.minAmount || 0)
                    }
                    className={`w-full py-4 rounded-xl font-medium transition-all ${
                      !investAmount || 
                      parseFloat(investAmount) <= 0 ||
                      parseFloat(investAmount) > parseFloat(tzsBalance) ||
                      parseFloat(investAmount) < (indexFunds.find(f => f.id === selectedFund)?.minAmount || 0)
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-500 hover:to-blue-300'
                    }`}
                  >
                    Invest Now
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* My Investments Tab */}
        {activeTab === 'positions' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-medium">Your Investment Positions</h3>
            
            {investedPositions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-xl p-8 text-center border border-white/10"
              >
                <TrendingUp className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Active Investments</h4>
                <p className="text-white/60 mb-4">Start investing to see your positions here</p>
                <button 
                  onClick={() => setActiveTab('funds')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Browse Investment Funds
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {investedPositions.map((position) => {
                  const fund = indexFunds.find(f => f.id === position.fundId);
                  if (!fund) return null;
                  
                  return (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${fund.color} flex items-center justify-center`}>
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{fund.name}</h4>
                            <p className="text-sm text-white/60">{fund.apy}% APY</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">Status</div>
                          <div className="text-green-400 font-medium capitalize">{position.status}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400">Invested Amount</p>
                          <p className="font-medium text-blue-400">{position.amount} TZS</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Est. Reward</p>
                          <p className="font-medium text-yellow-400">+{position.estimatedReward} TZS</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Start Date</p>
                          <p className="font-medium">{formatDate(position.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Maturity Date</p>
                          <p className="font-medium">{formatDate(position.endDate)}</p>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full mt-3 py-2 border border-white/20 rounded-lg flex items-center justify-center text-sm"
                        onClick={() => {}}
                      >
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10"
          >
            <h3 className="text-xl font-bold mb-4">Confirm Investment</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Fund</span>
                  <span>{indexFunds.find(f => f.id === selectedFund)?.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount</span>
                  <span>{investAmount} TZS</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Duration</span>
                  <span>{investDuration} {investDuration === 1 ? 'Month' : 'Months'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Return</span>
                  <span className="text-yellow-400">
                    {calculateReturns(
                      parseFloat(investAmount), 
                      indexFunds.find(f => f.id === selectedFund)?.apy || 0,
                      investDuration
                    )} TZS
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800 text-sm">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                  <p>
                    By investing, you agree to lock your funds for the selected period. 
                    Early withdrawal may result in reduced returns.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 border border-white/20 rounded-lg"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmInvest}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg font-medium"
                >
                  Confirm
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </WalletLayout>
  );
}
