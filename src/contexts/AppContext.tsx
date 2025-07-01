
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  employeeName: string;
  employeeId: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  categories: Category[];
  users: User[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'employeeName' | 'employeeId'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Data dummy
const dummyUsers: User[] = [
  { id: '1', name: 'Admin', email: 'admin@company.com', role: 'admin' },
  { id: '2', name: 'Dina', email: 'dina@company.com', role: 'employee' },
  { id: '3', name: 'Rizky', email: 'rizky@company.com', role: 'employee' },
  { id: '4', name: 'Budi', email: 'budi@company.com', role: 'employee' },
];

const dummyCategories: Category[] = [
  { id: '1', name: 'Gaji', type: 'expense' },
  { id: '2', name: 'Transportasi', type: 'expense' },
  { id: '3', name: 'Penjualan', type: 'income' },
  { id: '4', name: 'ATK', type: 'expense' },
  { id: '5', name: 'Konsultasi', type: 'income' },
];

const dummyTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-06-25',
    description: 'Pembelian tinta printer',
    amount: 250000,
    type: 'expense',
    category: 'ATK',
    employeeName: 'Dina',
    employeeId: '2'
  },
  {
    id: '2',
    date: '2024-06-24',
    description: 'Penjualan jasa konsultasi',
    amount: 1250000,
    type: 'income',
    category: 'Konsultasi',
    employeeName: 'Rizky',
    employeeId: '3'
  },
  {
    id: '3',
    date: '2024-06-23',
    description: 'Transport ke klien',
    amount: 150000,
    type: 'expense',
    category: 'Transportasi',
    employeeName: 'Budi',
    employeeId: '4'
  },
  {
    id: '4',
    date: '2024-06-22',
    description: 'Penjualan produk',
    amount: 500000,
    type: 'income',
    category: 'Penjualan',
    employeeName: 'Dina',
    employeeId: '2'
  },
  {
    id: '5',
    date: '2024-06-21',
    description: 'Gaji karyawan Juni',
    amount: 5000000,
    type: 'expense',
    category: 'Gaji',
    employeeName: 'Admin',
    employeeId: '1'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(dummyTransactions);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'employeeName' | 'employeeId'>) => {
    if (!currentUser) return;
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      employeeName: currentUser.name,
      employeeId: currentUser.id
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      transactions,
      setTransactions,
      categories: dummyCategories,
      users: dummyUsers,
      addTransaction,
      updateTransaction,
      deleteTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
