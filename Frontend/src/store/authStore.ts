// src/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, ApiUser } from '../services/api';
import { User, Account } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<boolean>;
  logout: () => void;
  updateUserAccounts: (accounts: Account[]) => void;
}

// Fonction pour convertir ApiUser en User
const createUserFromApi = (apiUser: ApiUser): User => ({
  id: apiUser.id.toString(),
  firstName: apiUser.firstName,
  lastName: apiUser.lastName,
  email: apiUser.email,
  accounts: [] // chargé séparément
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await authService.login({ email, password });
          if (response.user) {
            const user = createUserFromApi(response.user);
            set({
              isAuthenticated: true,
              user,
              loading: false,
            });
            return true;
          }
          set({ loading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ loading: false });
          return false;
        }
      },

      register: async (
        email: string,
        password: string,
        firstName: string,
        lastName: string
      ) => {
        set({ loading: true });
        try {
          const response = await authService.register({
            email,
            password,
            firstName,
            lastName,
          });
          if (response.user) {
            const user = createUserFromApi(response.user);
            set({
              isAuthenticated: true,
              user,
              loading: false,
            });
            return true;
          }
          set({ loading: false });
          return false;
        } catch (error) {
          console.error('Register error:', error);
          set({ loading: false });
          return false;
        }
      },

      updateUserAccounts: (accounts: Account[]) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              accounts,
            },
          });
        }
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// ✅ Optionnel : si tu veux aussi importer User et Account depuis authStore
export type { User, Account } from '../types';
