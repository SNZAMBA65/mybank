import { create } from 'zustand';
import { accountService, ApiAccount } from '../services/api';
import { Account } from '../types';

interface AccountState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  addAccount: (account: { name: string; type: string; balance?: number }) => Promise<void>;
  updateAccount: (id: string, data: Partial<{ name: string; type: string; balance: number }>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

// Fonction pour convertir ApiAccount en Account
const convertApiAccount = (apiAccount: ApiAccount): Account => ({
  id: apiAccount.id.toString(),
  name: apiAccount.name,
  type: apiAccount.type as 'checking' | 'savings' | 'credit',
  balance: parseFloat(apiAccount.balance),
  currency: apiAccount.currency,
  accountNumber: apiAccount.accountNumber
});

export const useAccountStore = create<AccountState>()((set) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const apiAccounts = await accountService.getAll();
      const accounts = apiAccounts.map(convertApiAccount);
      set({ accounts, loading: false });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      set({ error: 'Erreur lors du chargement des comptes', loading: false });
    }
  },

  addAccount: async (accountData) => {
    set({ loading: true, error: null });
    try {
      const newApiAccount = await accountService.create({
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance?.toString() || '0.00'
      });
      
      const newAccount = convertApiAccount(newApiAccount);
      set(state => ({ 
        accounts: [...state.accounts, newAccount],
        loading: false 
      }));
    } catch (error) {
      console.error('Error adding account:', error);
      set({ error: 'Erreur lors de la création du compte', loading: false });
    }
  },

  updateAccount: async (id: string, accountData) => {
    set({ loading: true, error: null });
    try {
      const updateData: Partial<{ name: string; type: string; balance: string }> = {};
      if (accountData.name) updateData.name = accountData.name;
      if (accountData.type) updateData.type = accountData.type;
      if (accountData.balance !== undefined) updateData.balance = accountData.balance.toString();

      const updatedApiAccount = await accountService.update(parseInt(id), updateData);
      const updatedAccount = convertApiAccount(updatedApiAccount);
      
      set(state => ({
        accounts: state.accounts.map(acc => acc.id === id ? updatedAccount : acc),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating account:', error);
      set({ error: 'Erreur lors de la modification du compte', loading: false });
    }
  },

  deleteAccount: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await accountService.delete(parseInt(id));
      set(state => ({
        accounts: state.accounts.filter(acc => acc.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting account:', error);
      set({ error: 'Erreur lors de la suppression', loading: false });
    }
  },
}));