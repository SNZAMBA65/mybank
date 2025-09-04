// Types communs pour toute l'application
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  accounts: Account[];
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  accountNumber: string;
}

export interface Operation {
  id: string;
  label: string;
  amount: number;
  date: Date;
  category: string;
  type: 'debit' | 'credit';
}

export interface Category {
  id: number;
  title: string;
}