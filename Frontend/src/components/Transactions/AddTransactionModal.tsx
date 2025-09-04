import React from 'react';
import { useState } from 'react';
import { useOperationStore } from '../../store/operationStore';
import { useAccountStore } from '../../store/accountStore';

/**
 * Props interface for AddTransactionModal component
 */
interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AddTransactionModal Component
 * 
 * Modal interface for creating new financial transactions with:
 * - Account selection from user's available accounts
 * - Transaction details input (label, amount, date)
 * - Category selection (optional, to be implemented)
 * - Form validation with error handling
 * - Loading states during submission
 * - Responsive modal design with backdrop overlay
 */
const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  // Store hooks for data management
  const { addOperation, loading } = useOperationStore();
  const { accounts } = useAccountStore();
  
  // Form state management with default values
  const [form, setForm] = useState({
    accountId: accounts[0]?.id || '', // Default to first available account
    label: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().slice(0, 10) // Today's date in YYYY-MM-DD format
  });
  
  // Error state for form validation feedback
  const [error, setError] = useState('');

  /**
   * Handle form submission
   * Validates required fields and submits transaction data to the store
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!form.accountId || !form.label || !form.amount) {
      setError('All fields are required');
      return;
    }

    try {
      // Submit transaction data to store
      await addOperation({
        label: form.label,
        amount: parseFloat(form.amount),
        date: new Date(form.date),
        categoryId: Number(form.categoryId),
        accountId: Number(form.accountId) // Ensure accountId is passed to store
      });
      
      // Close modal on successful submission
      onClose();
      
      // Reset form state for next use
      setForm({
        accountId: accounts[0]?.id || '',
        label: '',
        amount: '',
        categoryId: '',
        date: new Date().toISOString().slice(0, 10)
      });
    } catch {
      setError('Error occurred while adding transaction');
    }
  };

  // Don't render modal if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-xl space-y-4 min-w-[320px]">
        {/* Modal title */}
        <h2 className="text-lg font-bold">New Transaction</h2>
        
        {/* Account selection dropdown */}
        <select
          value={form.accountId}
          onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select an account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>

        {/* Transaction label input */}
        <input
          type="text"
          placeholder="Transaction label"
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />

        {/* Amount input */}
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />

        {/* Date input */}
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />

        {/* Category selection - TODO: Implement category dropdown */}
        {/* 
        <select
          value={form.categoryId}
          onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category</option>
          // Add category options here
        </select>
        */}

        {/* Error message display */}
        {error && <div className="text-red-600 text-sm">{error}</div>}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 bg-gray-200 hover:bg-gray-300 rounded p-2 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionModal;