
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard: React.FC = () => {
  const { transactions, currentUser } = useApp();

  // Menghitung total pemasukan dan pengeluaran
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Menghitung keuntungan bersih bulanan (bulan ini)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'income' && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyNetIncome = monthlyIncome - monthlyExpense;

  // Menghitung keuntungan all time (sama dengan netIncome tapi dengan label berbeda)
  const allTimeProfit = totalIncome - totalExpense;

  // Data untuk grafik mingguan
  const weeklyData = [
    { name: 'Sen', income: 500000, expense: 300000 },
    { name: 'Sel', income: 800000, expense: 450000 },
    { name: 'Rab', income: 1200000, expense: 600000 },
    { name: 'Kam', income: 950000, expense: 380000 },
    { name: 'Jum', income: 1100000, expense: 520000 },
    { name: 'Sab', income: 700000, expense: 250000 },
    { name: 'Min', income: 400000, expense: 150000 },
  ];

  // Transaksi terbaru (5 terakhir)
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang kembali, {currentUser?.name}!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <span className="text-green-600 text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-gray-500">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <span className="text-red-600 text-2xl">💸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-gray-500">
              +8% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keuntungan Bersih</CardTitle>
            <span className="text-blue-600 text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyNetIncome)}
            </div>
            <p className="text-xs text-gray-500">
              Keuntungan bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keuntungan All Time</CardTitle>
            <span className="text-indigo-600 text-2xl">🏆</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${allTimeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(allTimeProfit)}
            </div>
            <p className="text-xs text-gray-500">
              Total keuntungan keseluruhan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistik Transaksi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <span className="text-purple-600 text-2xl">📋</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {transactions.length}
            </div>
            <p className="text-xs text-gray-500">
              {transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length} hari ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Arus Kas Mingguan</CardTitle>
            <CardDescription>
              Perbandingan pemasukan dan pengeluaran per hari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
                <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Keuntungan</CardTitle>
            <CardDescription>
              Perkembangan keuntungan bersih mingguan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData.map(d => ({ ...d, profit: d.income - d.expense }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Keuntungan" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transaksi Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>
            5 transaksi terakhir yang dicatat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-lg ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{transaction.employeeName}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
