import React, { useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAccountStore } from '../store/accountStore';
import { useOperationStore } from '../store/operationStore';
import AccountCard from '../components/Accounts/AccountCard';
import TransactionItem from '../components/Transactions/TransactionItem';
import { Link } from 'react-router-dom';

/**
 * Dashboard Component
 * 
 * Main dashboard interface that provides users with:
 * - Financial overview with key statistics (total balance, income, expenses)
 * - Recent account information with quick management access
 * - Latest transaction history with navigation to full transaction view
 * - Loading states and empty states for better user experience
 * - Responsive grid layout for optimal viewing on all devices
 */
const Dashboard: React.FC = () => {
  // Store hooks for data management
  const { user } = useAuthStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { operations, fetchOperations, loading } = useOperationStore();
  
  /**
   * Load initial data on component mount
   * Fetches both accounts and operations data simultaneously
   */
  useEffect(() => {
    fetchAccounts();
    fetchOperations();
  }, [fetchAccounts, fetchOperations]);
  
  // Data processing for dashboard display
  const recentOperations = operations.slice(0, 5); // Show only 5 most recent operations
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0); // Calculate total balance across all accounts
  
  /**
   * Calculate monthly financial statistics
   * Filters operations from the last 30 days and categorizes by type
   */
  const monthlyIncome = operations
    .filter(op => op.type === 'credit' && op.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, op) => sum + Math.abs(op.amount), 0);
  
  const monthlyExpenses = operations
    .filter(op => op.type === 'debit' && op.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, op) => sum + Math.abs(op.amount), 0);

  /**
   * Dashboard statistics configuration
   * Defines the four main KPI cards with dynamic values and change indicators
   */
  const stats = [
    {
      name: 'Total Balance',
      value: `${totalBalance.toFixed(2)} EUR`,
      icon: DollarSign,
      color: 'bg-blue-500',
      change: totalBalance > 0 ? '+' + (totalBalance * 0.001).toFixed(1) + '%' : '0%',
      positive: totalBalance > 0
    },
    {
      name: 'Income This Month',
      value: `${monthlyIncome.toFixed(2)} EUR`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: monthlyIncome > 0 ? '+12.5%' : '0%', // Mock percentage - could be calculated from previous month
      positive: true
    },
    {
      name: 'Expenses This Month',
      value: `${monthlyExpenses.toFixed(2)} EUR`,
      icon: TrendingDown,
      color: 'bg-red-500',
      change: monthlyExpenses > 0 ? '-8.2%' : '0%', // Mock percentage - could be calculated from previous month
      positive: false
    },
    {
      name: 'Active Accounts',
      value: accounts.length.toString(),
      icon: CreditCard,
      color: 'bg-purple-500',
      change: '0%', // Account count change could be tracked
      positive: true
    }
  ];

  // Loading state - display while data is being fetched
  if (loading && operations.length === 0 && accounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hello, {user?.firstName}
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s an overview of your finances
        </p>
      </div>

      {/* Financial Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              {/* Stat icon with color coding */}
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {/* Change indicator with direction arrow */}
              <div className={`flex items-center text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.positive ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownLeft className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            {/* Stat value and label */}
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid - Accounts and Recent Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Accounts Overview Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Accounts ({accounts.length})</h2>
            <Link 
              to="/accounts"
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Manage
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Empty state when no accounts exist */}
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No accounts configured</p>
                <Link
                  to="/accounts"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Account
                </Link>
              </div>
            ) : (
              /* Display up to 3 accounts in compact mode */
              accounts.slice(0, 3).map((account) => (
                <AccountCard key={account.id} account={account} compact />
              ))
            )}
          </div>
        </div>

        {/* Recent Operations Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Operations</h2>
            <Link 
              to="/transactions"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {/* Display recent operations or empty state */}
            {recentOperations.length > 0 ? (
              recentOperations.map((operation) => (
                <TransactionItem 
                  key={operation.id} 
                  transaction={operation}
                  showAccount={false} // Don't show account info in dashboard view
                />
              ))
            ) : (
              /* Empty state when no recent operations exist */
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No recent operations</p>
                <Link
                  to="/transactions"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Operation
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;