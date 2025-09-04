import React from 'react';
import { MoreVertical, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { Account } from '../../store/authStore';

/**
 * Props interface for AccountCard component
 */
interface AccountCardProps {
  account: Account;
  compact?: boolean;
}

/**
 * AccountCard Component
 * 
 * Visual card representation of a bank account with:
 * - Account type-specific styling and icons
 * - Balance visibility toggle for privacy
 * - Responsive compact mode for dashboard use
 * - Gradient background with decorative patterns
 * - Balance trend indicators (positive/negative)
 * - Account details and type identification
 * - Interactive controls for viewing and management
 */
const AccountCard: React.FC<AccountCardProps> = ({ account, compact = false }) => {
  // State for balance visibility toggle
  const [showBalance, setShowBalance] = React.useState(true);

  /**
   * Get account type icon
   * Returns appropriate emoji icon based on account type
   * 
   * @param type - Account type string
   * @returns Emoji icon representing the account type
   */
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return '💳';
      case 'savings': return '🏦';
      case 'credit': return '💰';
      default: return '💳';
    }
  };

  /**
   * Get localized account type name
   * Returns human-readable account type in English
   * 
   * @param type - Account type string
   * @returns Localized account type name
   */
  const getAccountType = (type: string) => {
    switch (type) {
      case 'checking': return 'Checking Account';
      case 'savings': return 'Savings Account';
      case 'credit': return 'Credit Card';
      default: return 'Account';
    }
  };

  // Determine if balance is positive for styling purposes
  const isPositive = account.balance >= 0;

  return (
    <div className={`
      bg-gradient-to-br ${
        account.type === 'checking' ? 'from-blue-500 to-blue-600' :
        account.type === 'savings' ? 'from-green-500 to-green-600' :
        'from-purple-500 to-purple-600'
      } rounded-xl p-6 text-white relative overflow-hidden
      ${compact ? 'h-32' : 'h-48'}
    `}>
      
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white"></div>
        <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white"></div>
      </div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        
        {/* Header section with account info and controls */}
        <div className="flex items-start justify-between">
          <div>
            {/* Account name and type */}
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{getAccountIcon(account.type)}</span>
              <div>
                <h3 className="font-semibold">{account.name}</h3>
                <p className="text-sm opacity-80">{getAccountType(account.type)}</p>
              </div>
            </div>
            
            {/* Account number - only shown in full mode */}
            {!compact && (
              <p className="text-sm opacity-80 mt-2">{account.accountNumber}</p>
            )}
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center space-x-2">
            {/* Balance visibility toggle */}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            {/* More options menu */}
            <button 
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance section */}
        <div>
          <p className="text-sm opacity-80 mb-1">Available Balance</p>
          <div className="flex items-center justify-between">
            {/* Balance amount with privacy toggle */}
            <p className="text-2xl font-bold">
              {showBalance 
                ? `${account.balance.toFixed(2)} ${account.currency}`
                : '••••••'
              }
            </p>
            
            {/* Trend indicator - only shown in full mode */}
            {!compact && (
              <div className={`flex items-center text-sm ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {/* Mock percentage - in real app, calculate from historical data */}
                {isPositive ? '+2.1%' : '-1.5%'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;