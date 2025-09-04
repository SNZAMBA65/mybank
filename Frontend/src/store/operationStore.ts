import { create } from 'zustand';
import { operationService, categoryService, ApiOperation } from '../services/api';
import { Operation, Category } from '../types';

export interface OperationState {
  operations: Operation[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchOperations: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addOperation: (operation: { label: string; amount: number; date: Date; categoryId: number; accountId?: number }) => Promise<void>;
  updateOperation: (id: string, operation: { label: string; amount: number; date: Date; categoryId: number; accountId?: number }) => Promise<void>;
  deleteOperation: (id: string) => Promise<void>;
}

// Fonction pour convertir ApiOperation en Operation
const convertApiOperation = (apiOp: ApiOperation): Operation => ({
  id: apiOp.id.toString(),
  label: apiOp.label,
  amount: parseFloat(apiOp.amount),
  date: new Date(apiOp.date), // ✅ garde la date avec l’heure
  category: apiOp.category.title,
  type: parseFloat(apiOp.amount) < 0 ? 'debit' : 'credit'
});

export const useOperationStore = create<OperationState>()((set) => ({
  operations: [],
  categories: [],
  loading: false,
  error: null,

  fetchOperations: async () => {
    set({ loading: true, error: null });
    try {
      const apiOperations = await operationService.getAll();
      const operations = apiOperations.map(convertApiOperation);
      set({ operations, loading: false });
    } catch (error) {
      console.error('Error fetching operations:', error);
      set({ error: 'Erreur lors du chargement des opérations', loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await categoryService.getAll();
      set({ categories, loading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Erreur lors du chargement des catégories', loading: false });
    }
  },

  addOperation: async (operationData) => {
    set({ loading: true, error: null });
    try {
      const newApiOperation = await operationService.create({
        label: operationData.label,
        amount: operationData.amount.toString(),
        date: operationData.date.toISOString(), // ✅ on envoie la date complète avec heure
        categoryId: operationData.categoryId,
        accountId: operationData.accountId
      });
      
      const newOperation = convertApiOperation(newApiOperation);
      set(state => ({ 
        operations: [newOperation, ...state.operations],
        loading: false 
      }));
    } catch (error) {
      console.error('Error adding operation:', error);
      set({ error: 'Erreur lors de l\'ajout de l\'opération', loading: false });
    }
  },

  updateOperation: async (id: string, operationData) => {
    set({ loading: true, error: null });
    try {
      const updatedApiOperation = await operationService.update(parseInt(id), {
        label: operationData.label,
        amount: operationData.amount.toString(),
        date: operationData.date.toISOString(), // ✅ on envoie la date complète avec heure
        categoryId: operationData.categoryId,
        accountId: operationData.accountId
      });
      
      const updatedOperation = convertApiOperation(updatedApiOperation);
      set(state => ({
        operations: state.operations.map(op => op.id === id ? updatedOperation : op),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating operation:', error);
      set({ error: 'Erreur lors de la modification de l\'opération', loading: false });
    }
  },

  deleteOperation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await operationService.delete(parseInt(id));
      set(state => ({
        operations: state.operations.filter(op => op.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting operation:', error);
      set({ error: 'Erreur lors de la suppression', loading: false });
    }
  },
}));