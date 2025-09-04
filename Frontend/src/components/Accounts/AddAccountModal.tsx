// src/components/Accounts/AddAccountModal.tsx
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAccountStore } from '../../store/accountStore';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ajout du type strict pour le type de compte
type AccountType = "checking" | "savings" | "credit";

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, loading } = useAccountStore();
  // Typage strict de formData
  const [formData, setFormData] = useState<{
    name: string;
    type: AccountType;
    balance: string;
  }>({
    name: '',
    type: 'checking',
    balance: '0'
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const newErrors: string[] = [];
    if (!formData.name.trim()) newErrors.push('Le nom du compte est requis');
    if (!formData.type) newErrors.push('Le type de compte est requis');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await addAccount({
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0
      });
      
      setFormData({ name: '', type: 'checking', balance: '0' });
      onClose();
    } catch {
      setErrors(['Erreur lors de la création du compte']);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Nouveau compte</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom du compte *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Compte Courant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AccountType }))}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="checking">Compte Courant</option>
              <option value="savings">Compte Épargne</option>
              <option value="credit">Compte Crédit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Solde initial (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;