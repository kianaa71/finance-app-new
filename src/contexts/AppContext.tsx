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
  // Income categories
  { id: '1', name: 'Penjualan Produk', type: 'income' },
  { id: '2', name: 'Jasa/Proyek Klien', type: 'income' },
  { id: '3', name: 'Pendapatan Lain-lain', type: 'income' },
  
  // Expense categories
  { id: '4', name: 'Gaji & Tunjangan', type: 'expense' },
  { id: '5', name: 'Transportasi & Perjalanan Dinas', type: 'expense' },
  { id: '6', name: 'Operasional Kantor', type: 'expense' },
  { id: '7', name: 'Peralatan & Inventaris', type: 'expense' },
  { id: '8', name: 'Marketing & Iklan', type: 'expense' },
  { id: '9', name: 'Makan & Konsumsi', type: 'expense' },
  { id: '10', name: 'Biaya Meeting / Rapat', type: 'expense' },
  { id: '11', name: 'Pajak & Perizinan', type: 'expense' },
  { id: '12', name: 'Training & Pengembangan SDM', type: 'expense' },
  { id: '13', name: 'Biaya Bank & Administrasi', type: 'expense' },
];

const dummyTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-06-25',
    description: 'Pembelian printer kantor baru',
    amount: 2500000,
    type: 'expense',
    category: 'Peralatan & Inventaris',
    employeeName: 'Dina',
    employeeId: '2'
  },
  {
    id: '2',
    date: '2024-06-24',
    description: 'Penjualan jasa konsultasi IT',
    amount: 15000000,
    type: 'income',
    category: 'Jasa/Proyek Klien',
    employeeName: 'Rizky',
    employeeId: '3'
  },
  {
    id: '3',
    date: '2024-06-23',
    description: 'Transport ke klien dan hotel',
    amount: 850000,
    type: 'expense',
    category: 'Transportasi & Perjalanan Dinas',
    employeeName: 'Budi',
    employeeId: '4'
  },
  {
    id: '4',
    date: '2024-06-22',
    description: 'Penjualan produk software',
    amount: 8500000,
    type: 'income',
    category: 'Penjualan Produk',
    employeeName: 'Dina',
    employeeId: '2'
  },
  {
    id: '5',
    date: '2024-06-21',
    description: 'Gaji karyawan Juni 2024',
    amount: 25000000,
    type: 'expense',
    category: 'Gaji & Tunjangan',
    employeeName: 'Admin',
    employeeId: '1'
  },
  {
    id: '6',
    date: '2024-06-20',
    description: 'Bayar listrik dan internet kantor',
    amount: 1200000,
    type: 'expense',
    category: 'Operasional Kantor',
    employeeName: 'Admin',
    employeeId: '1'
  },
  {
    id: '7',
    date: '2024-06-19',
    description: 'Iklan Google Ads campaign',
    amount: 2000000,
    type: 'expense',
    category: 'Marketing & Iklan',
    employeeName: 'Rizky',
    employeeId: '3'
  },
  {
    id: '8',
    date: '2024-06-18',
    description: 'Konsumsi meeting dengan klien',
    amount: 450000,
    type: 'expense',
    category: 'Makan & Konsumsi',
    employeeName: 'Budi',
    employeeId: '4'
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
