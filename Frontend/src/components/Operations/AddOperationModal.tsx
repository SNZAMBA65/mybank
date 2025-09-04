import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useOperationStore } from '../../store/operationStore';
import { useAccountStore } from '../../store/accountStore';

/**
 * Props interface for AddOperationModal component
 */
interface AddOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AddOperationModal Component
 * 
 * Comprehensive modal for creating new financial operations with:
 * - Complete form validation with error messaging
 * - Account balance checking and overdraft warnings
 * - Category and account selection from user's data
 * - Real-time balance updates after operation creation
 * - Support for both positive (income) and negative (expense) amounts
 * - Automatic form reset and cleanup on close
 * - Loading states during submission
 * - Responsive modal design with proper accessibility
 */
const AddOperationModal: React.FC<AddOperationModalProps> = ({ isOpen, onClose }) => {
  // Store hooks for data management
  const { categories, fetchCategories, addOperation, loading } = useOperationStore();
  const { accounts, fetchAccounts } = useAccountStore();
  
  // Form state management with default values
  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    categoryId: '',
    accountId: ''
  });
  
  // Error handling state
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Load categories and accounts when modal opens
   * Ensures fresh data is available for user selection
   */
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchAccounts();
    }
  }, [isOpen, fetchCategories, fetchAccounts]);

  /**
   * Handle form submission with comprehensive validation
   * Includes balance checking for expense operations and overdraft warnings
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Form validation - check all required fields
    const newErrors: string[] = [];
    if (!formData.label.trim()) newErrors.push('Label is required');
    if (!formData.amount.trim()) newErrors.push('Amount is required');
    if (!formData.categoryId) newErrors.push('A category is required');
    if (!formData.date) newErrors.push('Date is required');

    // Stop submission if validation errors exist
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Balance checking for expense operations
    const amount = parseFloat(formData.amount);
    if (amount < 0 && formData.accountId) {
      const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
      if (selectedAccount && selectedAccount.balance + amount < 0 && selectedAccount.type !== 'credit') {
        // Show overdraft warning for non-credit accounts
        if (!window.confirm(
          `This operation will put your account "${selectedAccount.name}" into overdraft (${(selectedAccount.balance + amount).toFixed(2)}€). Continue?`
        )) {
          return;
        }
      }
    }

    try {
      // Submit operation to store
      await addOperation({
        label: formData.label,
        amount: amount,
        date: new Date(formData.date),
        categoryId: parseInt(formData.categoryId),
        accountId: formData.accountId ? parseInt(formData.accountId) : undefined
      });
      
      // Refresh account data to show updated balances
      await fetchAccounts();
      
      // Reset form and close modal on successful submission
      setFormData({
        label: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        accountId: ''
      });
      onClose();
    } catch {
      setErrors(['Error occurred while creating the operation']);
    }
  };

  /**
   * Handle modal close with form cleanup
   * Resets form state and clears any error messages
   */
  const handleClose = () => {
    setFormData({
      label: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      accountId: ''
    });
    setErrors([]);
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Operation</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction label field */}
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
              Label *
            </label>
            <input
              id="label"
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Groceries, Restaurant..."
            />
          </div>

          {/* Amount field with instructions */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount * (€)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., -25.50 for expense, 2000 for income"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use negative amount for expenses (e.g., -25.50)
            </p>
          </div>

          {/* Date field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Account selection (optional) */}
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
              Account
            </label>
            <select
              id="accountId"
              value={formData.accountId}
              onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an account (optional)</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.balance.toFixed(2)}€)
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Account balance will be automatically updated
            </p>
          </div>

          {/* Category selection (required) */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          {/* Error messages display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                'Adding...'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOperationModal;