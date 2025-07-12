'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletLayout } from '@/components/wallet/WalletLayout';
import { ArrowLeft, TrendingUp, Info, ChevronRight, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/useWalletStore';
import { useAuth } from '@/hooks/useAuth';
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

// Mock data for user's staked positions
const initialStakedPositions = [
  {
    id: 'stake-1',
    fundId: 'neda-index-1',
    amount: 500,
    startDate: new Date(2025, 6, 1), // July 1, 2025
    endDate: new Date(2025, 9, 1),   // October 1, 2025
    estimatedReward: 10.62,
    status: 'active'
  }
];

export default function StakePage() {
  const router = useRouter();
  const { /* authenticated */ } = useAuth();
  const { balances } = useWalletStore();
  
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDuration, setStakeDuration] = useState(3); // months
  const [stakedPositions, setStakedPositions] = useState(initialStakedPositions);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'funds' | 'positions'>('funds');
  
  // Get current balance for TZS
  const tzsBalance = balances.find(b => b.symbol === 'TZS')?.balance || '0';
  
  // Calculate estimated returns
  const calculateReturns = (amount: number, apy: number, months: number) => {
    return (amount * (apy / 100) * (months / 12)).toFixed(2);
  };
  
  // Handle stake submission
  const handleStake = () => {
    if (!selectedFund || !stakeAmount) return;
    
    const fund = indexFunds.find(f => f.id === selectedFund);
    if (!fund) return;
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  // Confirm staking
  const confirmStake = () => {
    if (!selectedFund || !stakeAmount) return;
    
    const fund = indexFunds.find(f => f.id === selectedFund);
    if (!fund) return;
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Create new staked position
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + stakeDuration);
    
    const newPosition = {
      id: `stake-${Date.now()}`,
      fundId: selectedFund,
      amount: amount,
      startDate: startDate,
      endDate: endDate,
      estimatedReward: parseFloat(calculateReturns(amount, fund.apy, stakeDuration)),
      status: 'active'
    };
    
    // Add to staked positions
    setStakedPositions([...stakedPositions, newPosition]);
    
    // Reset form and close confirmation
    setSelectedFund(null);
    setStakeAmount('');
    setStakeDuration(3);
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
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => router.back()}
          className="mr-3 p-2 rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Stake & Earn</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'funds' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-white/60'}`}
          onClick={() => setActiveTab('funds')}
        >
          Index Funds
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'positions' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-white/60'}`}
          onClick={() => setActiveTab('positions')}
        >
          My Positions
        </button>
      </div>
      
      {activeTab === 'funds' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Available Balance */}
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available Balance</span>
              <span className="font-bold">{tzsBalance} TZS</span>
            </div>
          </div>
          
          {/* Fund Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3">Select an Index Fund</h3>
            <div className="space-y-3">
              {indexFunds.map((fund) => (
                <motion.button
                  key={fund.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFund(fund.id)}
                  className={`w-full p-4 rounded-xl border ${
                    selectedFund === fund.id 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-white/10 bg-gray-900'
                  } flex items-center justify-between`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${fund.color} flex items-center justify-center mr-3`}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">{fund.name}</h4>
                      <p className="text-sm text-gray-400">{fund.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold flex items-center">
                      {fund.apy}% <Percent className="w-4 h-4 ml-1" />
                    </div>
                    <p className="text-xs text-gray-400">APY</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Staking Form - only show if a fund is selected */}
          {selectedFund && (
            <div className="bg-gray-900 rounded-xl p-4 space-y-4">
              <h3 className="text-lg font-medium">Stake Details</h3>
              
              {/* Amount Input */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Amount (TZS)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-white"
                  placeholder="Enter amount"
                  value={stakeAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                      setStakeAmount(value);
                    }
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Min: {indexFunds.find(f => f.id === selectedFund)?.minAmount} TZS
                  </span>
                  <button 
                    className="text-xs text-blue-400"
                    onClick={() => setStakeAmount(tzsBalance)}
                  >
                    Max
                  </button>
                </div>
              </div>
              
              {/* Duration Selection */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Staking Period</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 6].map((months) => (
                    <button
                      key={months}
                      onClick={() => setStakeDuration(months)}
                      className={`p-3 rounded-lg ${
                        stakeDuration === months 
                          ? 'bg-blue-900/30 border border-blue-500' 
                          : 'bg-gray-800 border border-white/10'
                      }`}
                    >
                      {months} {months === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Estimated Returns */}
              {stakeAmount && parseFloat(stakeAmount) > 0 && (
                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Estimated Returns</span>
                    <span className="text-yellow-400 font-bold">
                      {calculateReturns(
                        parseFloat(stakeAmount), 
                        indexFunds.find(f => f.id === selectedFund)?.apy || 0,
                        stakeDuration
                      )} TZS
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-300">Total at Maturity</span>
                    <span className="font-bold">
                      {(parseFloat(stakeAmount) + parseFloat(calculateReturns(
                        parseFloat(stakeAmount), 
                        indexFunds.find(f => f.id === selectedFund)?.apy || 0,
                        stakeDuration
                      ))).toFixed(2)} TZS
                    </span>
                  </div>
                </div>
              )}
              
              {/* Stake Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStake}
                disabled={
                  !stakeAmount || 
                  parseFloat(stakeAmount) <= 0 ||
                  parseFloat(stakeAmount) > parseFloat(tzsBalance) ||
                  parseFloat(stakeAmount) < (indexFunds.find(f => f.id === selectedFund)?.minAmount || 0)
                }
                className={`w-full py-4 rounded-full text-white text-xl font-medium ${
                  !stakeAmount || 
                  parseFloat(stakeAmount) <= 0 ||
                  parseFloat(stakeAmount) > parseFloat(tzsBalance) ||
                  parseFloat(stakeAmount) < (indexFunds.find(f => f.id === selectedFund)?.minAmount || 0)
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400'
                }`}
              >
                Stake Now
              </motion.button>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium">Your Staked Positions</h3>
          
          {stakedPositions.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <div className="bg-gray-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="text-lg font-medium mb-2">No Active Stakes</h4>
              <p className="text-gray-400 mb-4">You don&apos;t have any active staking positions yet.</p>
              <button 
                onClick={() => setActiveTab('funds')}
                className="px-4 py-2 bg-blue-600 rounded-lg text-white"
              >
                Start Staking
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stakedPositions.map((position) => {
                const fund = indexFunds.find(f => f.id === position.fundId);
                
                return (
                  <div 
                    key={position.id}
                    className="bg-gray-900 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${fund?.color || 'from-blue-600 to-blue-400'} flex items-center justify-center mr-2`}>
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-medium">{fund?.name || 'Index Fund'}</h4>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        position.status === 'active' 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {position.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Staked Amount</p>
                        <p className="font-medium">{position.amount} TZS</p>
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
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10"
          >
            <h3 className="text-xl font-bold mb-4">Confirm Staking</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Fund</span>
                  <span>{indexFunds.find(f => f.id === selectedFund)?.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount</span>
                  <span>{stakeAmount} TZS</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Duration</span>
                  <span>{stakeDuration} {stakeDuration === 1 ? 'Month' : 'Months'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Return</span>
                  <span className="text-yellow-400">
                    {calculateReturns(
                      parseFloat(stakeAmount), 
                      indexFunds.find(f => f.id === selectedFund)?.apy || 0,
                      stakeDuration
                    )} TZS
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800 text-sm">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                  <p>
                    By staking, you agree to lock your funds for the selected period. 
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
                  onClick={confirmStake}
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
