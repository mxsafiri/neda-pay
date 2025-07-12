'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  // Wallet, // Commented out as it's currently unused
  QrCode,
  Plus,
  ArrowLeftRight,
  // Receipt, // Commented out as it's currently unused
  History
} from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({ 
  icon, 
  label, 
  onClick,
  primary = false
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl ${
        primary 
          ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white' 
          : 'bg-gray-900 text-white'
      }`}
    >
      <div className={`mb-2 p-2 rounded-full ${primary ? 'bg-white/20' : 'bg-blue-500/20'}`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

export default function QuickActions() {
  const router = useRouter();
  
  // Primary actions (most common)
  const primaryActions = [
    {
      icon: <ArrowUpRight className="w-5 h-5" />,
      label: 'Send',
      onClick: () => router.push('/payment?manual=true')
    },
    {
      icon: <QrCode className="w-5 h-5" />,
      label: 'Scan',
      onClick: () => router.push('/scan')
    }
  ];
  
  // Secondary actions
  const secondaryActions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Buy',
      onClick: () => router.push('/buy')
    },
    {
      icon: <ArrowDownLeft className="w-5 h-5" />,
      label: 'Receive',
      onClick: () => router.push('/receive')
    },
    {
      icon: <ArrowLeftRight className="w-5 h-5" />,
      label: 'Swap',
      onClick: () => router.push('/swap')
    },
    {
      icon: <History className="w-5 h-5" />,
      label: 'History',
      onClick: () => router.push('/activity')
    }
  ];
  
  return (
    <div className="w-full space-y-4">
      {/* Primary Actions - 2 large buttons */}
      <div className="grid grid-cols-2 gap-3">
        {primaryActions.map((action, index) => (
          <QuickAction
            key={`primary-${index}`}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            primary={true}
          />
        ))}
      </div>
      
      {/* Secondary Actions - 4 smaller buttons */}
      <div className="grid grid-cols-4 gap-2">
        {secondaryActions.map((action, index) => (
          <QuickAction
            key={`secondary-${index}`}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  );
}
