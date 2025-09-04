import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, Plus } from 'lucide-react';
import { useOperationStore } from '../store/operationStore';
import TransactionItem from '../components/Transactions/TransactionItem';
import AddOperationModal from '../components/Operations/AddOperationModal';

/**
 * Transactions Component
 * 
 * Comprehensive transaction management interface that provides:
 * - Complete transaction history with search and filtering capabilities
 * - Real-time search across transaction labels and categories
 * - Filter by transaction type (all, income, expenses)
 * - Sort by date, amount, or description
 * - PDF export functionality for transaction data
 * - Period selection for date range filtering
 * - Transaction creation with modal interface
 * - Empty states with guided actions for new users
 * - Loading states and responsive design
 */
const Transactions: React.FC = () => {
  // Store hooks for operation management
  const { operations, fetchOperations, loading } = useOperationStore();
  
  // Component state management
  const [searchTerm, setSearchTerm] = useState(''); // Search input value
  const [selectedFilter, setSelectedFilter] = useState('all'); // Transaction type filter
  const [sortBy, setSortBy] = useState('date'); // Sorting criteria
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Add operation modal state
  const [isExporting, setIsExporting] = useState(false); // Loading state for PDF export

  /**
   * Load operations data on component mount
   * Ensures fresh transaction data is available when user navigates to this page
   */
  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  /**
   * Process operations with filtering and sorting
   * Applies search term, transaction type filter, and sorting criteria
   */
  const filteredOperations = operations
    .filter(operation => {
      // Search filter - matches label or category (case-insensitive)
      const matchesSearch = operation.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           operation.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter - all, income (credit), or expense (debit)
      if (selectedFilter === 'all') return matchesSearch;
      if (selectedFilter === 'income') return matchesSearch && operation.type === 'credit';
      if (selectedFilter === 'expense') return matchesSearch && operation.type === 'debit';
      
      return matchesSearch;
    })
    .sort((a, b) => {
      // Sorting logic based on selected criteria
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime(); // Most recent first
      if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount); // Highest amount first
      return a.label.localeCompare(b.label); // Alphabetical by description
    });

  /**
   * Handle PDF export functionality
   * Generates and downloads a PDF report of transactions with applied filters
   */
  const handleExportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // ✅ Import jsPDF correctement (default export)
      const jsPDF = (await import('jspdf')).default;
      
      // Create new PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // PDF Header
      pdf.setFontSize(20);
      pdf.text('MyBank - Transactions Report', 20, 30);
      
      // Current date and filters applied
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generated on: ${currentDate}`, 20, 45);
      
      // Show applied filters
      let filtersText = `Filters: ${selectedFilter === 'all' ? 'All Types' : selectedFilter === 'income' ? 'Income Only' : 'Expenses Only'}`;
      if (searchTerm.trim()) {
        filtersText += `, Search: "${searchTerm.trim()}"`;
      }
      filtersText += `, Sorted by: ${sortBy}`;
      pdf.text(filtersText, 20, 55);
      
      // Summary Statistics
      pdf.setFontSize(16);
      pdf.text('Transaction Summary', 20, 75);
      
      const totalIncome = filteredOperations
        .filter(op => op.type === 'credit')
        .reduce((sum, op) => sum + Math.abs(op.amount), 0);
      
      const totalExpenses = filteredOperations
        .filter(op => op.type === 'debit')
        .reduce((sum, op) => sum + Math.abs(op.amount), 0);
      
      const netAmount = totalIncome - totalExpenses;
      
      pdf.setFontSize(12);
      pdf.text(`Total Income: €${totalIncome.toFixed(2)}`, 20, 95);
      pdf.text(`Total Expenses: €${totalExpenses.toFixed(2)}`, 20, 110);
      pdf.text(`Net Amount: €${netAmount.toFixed(2)}`, 20, 125);
      pdf.text(`Total Transactions: ${filteredOperations.length}`, 20, 140);
      
      // Transactions Details
      pdf.setFontSize(16);
      pdf.text('Transaction Details', 20, 165);
      
      let yPosition = 185;
      const lineHeight = 65; // ✅ utilisé pour espacer correctement les transactions
      
      filteredOperations.forEach((transaction, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Format date
        const transactionDate = new Date(transaction.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        const transactionTime = new Date(transaction.date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        // Transaction header
        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${transaction.label}`, 20, yPosition);
        
        // Transaction details
        pdf.setFontSize(10);
        pdf.text(`Date: ${transactionDate} at ${transactionTime}`, 30, yPosition + 12);
        pdf.text(`Category: ${transaction.category}`, 30, yPosition + 24);
        pdf.text(`Type: ${transaction.type === 'credit' ? 'Income' : 'Expense'}`, 30, yPosition + 36);
        
        // Amount with color indication (text-based)
        const amountText = `Amount: €${Math.abs(transaction.amount).toFixed(2)} (${transaction.type === 'credit' ? 'Credit' : 'Debit'})`;
        pdf.text(amountText, 30, yPosition + 48);
        
        yPosition += lineHeight;
        
        // Add separator line
        if (index < filteredOperations.length - 1 && yPosition < pageHeight - 60) {
          pdf.line(20, yPosition - 10, pageWidth - 20, yPosition - 10);
        }
      });
      
      // Footer on last page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(10);
      pdf.text('This report was generated by MyBank application.', 20, pageHeight - 30);
      pdf.text('For support, contact: support@mybank.com', 20, pageHeight - 20);
      
      // Generate filename with current date and filters
      let filename = `MyBank_Transactions_${new Date().toISOString().split('T')[0]}`;
      if (selectedFilter !== 'all') {
        filename += `_${selectedFilter}`;
      }
      if (searchTerm.trim()) {
        filename += `_filtered`;
      }
      filename += '.pdf';
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error occurred while generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state - display while fetching initial data
  if (loading && operations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">
            History of all your transactions
          </p>
        </div>
        
        {/* Action buttons - Period, Export, Add */}
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            Period
          </button>
          
          {/* PDF Export Button */}
          <button 
            onClick={handleExportToPDF}
            disabled={isExporting || filteredOperations.length === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={filteredOperations.length === 0 ? "No transactions to export" : "Export transactions to PDF"}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Generating PDF...' : 'Export PDF'}
          </button>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search input with icon */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filter and sort controls */}
          <div className="flex gap-4">
            {/* Transaction type filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            
            {/* Sort criteria selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="description">Description</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* List header with result count */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredOperations.length} transaction(s) found
          </h2>
        </div>
        
        {/* Transaction items or empty state */}
        <div className="divide-y divide-gray-100">
          {filteredOperations.length === 0 ? (
            /* Empty state when no transactions match filters */
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No transactions found</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first transaction
              </button>
            </div>
          ) : (
            /* List of filtered and sorted transactions */
            filteredOperations.map((operation) => (
              <div key={operation.id} className="p-4 hover:bg-gray-50 transition-colors">
                <TransactionItem 
                  transaction={operation} 
                  showAccount={true} // Show account information in transaction list view
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Operation Modal */}
      <AddOperationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default Transactions;
