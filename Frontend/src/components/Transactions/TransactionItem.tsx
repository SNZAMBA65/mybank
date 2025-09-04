import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Edit, Trash2, Save, X } from 'lucide-react';
import { Operation } from '../../types';
import { useOperationStore } from '../../store/operationStore';

/**
 * Props interface for TransactionItem component
 */
interface TransactionItemProps {
  transaction: Operation;
  showAccount?: boolean;
}

/**
 * TransactionItem Component
 * 
 * Displays a single financial transaction with edit/delete functionality
 * Shows transaction details including amount, date, time, category, and account
 * Provides inline editing capabilities with form validation
 * Handles transaction type detection (credit/debit) and visual styling
 * PRESERVES ORIGINAL TIME when editing transactions
 */
const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, showAccount = false }) => {
  // Store hooks for operation management
  const { deleteOperation, updateOperation, categories, fetchCategories } = useOperationStore();
  
  // Component state management
  const [isEditing, setIsEditing] = useState(false); // Controls edit mode display
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete operation
  const [isSaving, setIsSaving] = useState(false); // Loading state for save operation
  
  // Edit form data state with initial values from transaction
  // FIXED: Use datetime-local format to preserve time
  const [editData, setEditData] = useState({
    label: transaction.label,
    amount: Math.abs(transaction.amount).toString(),
    isNegative: transaction.amount < 0,
    date: new Date(transaction.date).toISOString().slice(0, 16), // datetime-local format (YYYY-MM-DDTHH:MM)
    categoryId: ''
  });

  // Determine transaction type and amount for display
  const isCredit = transaction.type === 'credit';
  const amount = Math.abs(transaction.amount);

  /**
   * Effect: Load categories when entering edit mode
   * Ensures categories are available for the dropdown selection
   */
  useEffect(() => {
    if (isEditing && categories.length === 0) {
      fetchCategories();
    }
  }, [isEditing, categories.length, fetchCategories]);

  /**
   * Effect: Update categoryId when categories are loaded
   * Matches the current transaction category with available categories
   */
  useEffect(() => {
    if (categories.length > 0 && !editData.categoryId) {
      const currentCategory = categories.find(cat => cat.title === transaction.category);
      if (currentCategory) {
        setEditData(prev => ({ ...prev, categoryId: currentCategory.id.toString() }));
      }
    }
  }, [categories, transaction.category, editData.categoryId]);

  /**
   * Format date with time for display
   * Shows both date and time in US locale format
   * 
   * @param date - Date object to format
   * @returns Formatted date and time string
   */
  const formatDateTime = (date: Date) => {
    const dateObj = new Date(date);
    
    // Format date part
    const dateString = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
    
    // Format time part
    const timeString = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(dateObj);
    
    return `${dateString} at ${timeString}`;
  };

  /**
   * Handle transaction deletion
   * Shows confirmation dialog and performs deletion with loading state
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setIsDeleting(true);
      try {
        await deleteOperation(transaction.id);
      } catch (error) {
        console.error('Error during deletion:', error);
        alert('Error occurred while deleting the transaction');
      }
      setIsDeleting(false);
    }
  };

  /**
   * Enter edit mode
   * Initializes edit form data with current transaction values
   * FIXED: Preserve original time using datetime-local format
   */
  const handleEdit = () => {
    setIsEditing(true);
    // Reset edit data with current transaction values, preserving time
    setEditData({
      label: transaction.label,
      amount: Math.abs(transaction.amount).toString(),
      isNegative: transaction.amount < 0,
      date: new Date(transaction.date).toISOString().slice(0, 16), // Preserve time with datetime-local format
      categoryId: ''
    });
  };

  /**
   * Save transaction changes
   * Validates form data and submits updates to the store
   * FIXED: Send complete datetime to backend
   */
  const handleSave = async () => {
    // Form validation - check required fields
    if (!editData.label.trim() || !editData.amount || !editData.date || !editData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // Calculate final amount based on positive/negative selection
      const finalAmount = editData.isNegative ? -parseFloat(editData.amount) : parseFloat(editData.amount);
      
      // FIXED: Create date with preserved time from datetime-local input
      const dateWithTime = new Date(editData.date);
      
      // Submit update to store
      await updateOperation(transaction.id, {
        label: editData.label.trim(),
        amount: finalAmount,
        date: dateWithTime, // Send complete datetime
        categoryId: parseInt(editData.categoryId)
      });
      
      // Exit edit mode on successful save
      setIsEditing(false);
    } catch (error) {
      console.error('Error during modification:', error);
      alert('Error occurred while updating the transaction');
    }
    setIsSaving(false);
  };

  /**
   * Cancel edit operation
   * Resets form data and exits edit mode without saving
   * FIXED: Preserve time when canceling
   */
  const handleCancel = () => {
    // Reset form data to original transaction values, preserving time
    setEditData({
      label: transaction.label,
      amount: Math.abs(transaction.amount).toString(),
      isNegative: transaction.amount < 0,
      date: new Date(transaction.date).toISOString().slice(0, 16), // Preserve original time
      categoryId: ''
    });
    setIsEditing(false);
  };

  // Render edit mode interface
  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="space-y-3">
          {/* Transaction label input */}
          <div>
            <label className="block text-sm font-medium mb-1">Label *</label>
            <input
              type="text"
              value={editData.label}
              onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Groceries, Restaurant..."
            />
          </div>
          
          {/* Amount and date inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <div className="flex">
                {/* Positive/Negative selector */}
                <select
                  value={editData.isNegative ? 'negative' : 'positive'}
                  onChange={(e) => setEditData(prev => ({ ...prev, isNegative: e.target.value === 'negative' }))}
                  className="px-3 py-2 border rounded-l focus:ring-2 focus:ring-blue-500"
                >
                  <option value="negative">-</option>
                  <option value="positive">+</option>
                </select>
                {/* Amount input */}
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editData.amount}
                  onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
                  className="flex-1 px-3 py-2 border-t border-b border-r rounded-r focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Date and time input - FIXED: Use datetime-local */}
            <div>
              <label className="block text-sm font-medium mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                value={editData.date}
                onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={editData.categoryId}
              onChange={(e) => setEditData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !editData.label.trim() || !editData.amount || !editData.categoryId}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render normal display mode
  return (
    <div className="flex items-center justify-between group">
      {/* Transaction info section */}
      <div className="flex items-center space-x-4">
        {/* Transaction type icon */}
        <div className={`p-2 rounded-full ${
          isCredit 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {isCredit ? (
            <ArrowDownLeft className="w-4 h-4" />
          ) : (
            <ArrowUpRight className="w-4 h-4" />
          )}
        </div>
        
        {/* Transaction details */}
        <div className="flex-1">
          {/* Label and category */}
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{transaction.label}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {transaction.category}
            </span>
          </div>
          
          {/* Date, time, and account info */}
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span>{formatDateTime(transaction.date)}</span>
            {showAccount && (
              <>
                <span className="mx-2">•</span>
                <span>Main Account</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Amount and actions section */}
      <div className="flex items-center gap-3">
        {/* Amount display */}
        <div className="text-right">
          <div className={`text-lg font-semibold ${
            isCredit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCredit ? '+' : '-'}{amount.toFixed(2)} €
          </div>
          <div className="text-sm text-gray-500">
            {isCredit ? 'Credit' : 'Debit'}
          </div>
        </div>

        {/* Action buttons (visible on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={handleEdit}
            disabled={isDeleting}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || isEditing}
            className="p-2 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;