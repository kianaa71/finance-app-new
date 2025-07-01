
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const { transactions } = useApp();
  const [filterPeriod, setFilterPeriod] = useState('monthly');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  // Menghitung ringkasan berdasarkan periode
  const calculateSummary = () => {
    const now = new Date();
    let filteredTransactions = transactions;

    if (filterPeriod === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (filterPeriod === 'monthly') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredTransactions = transactions.filter(t => new Date(t.date) >= monthAgo);
    }

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, net: income - expense, count: filteredTransactions.length };
  };

  const summary = calculateSummary();

  // Data untuk grafik kategori
  const categoryData = transactions.reduce((acc: any, transaction) => {
    const existing = acc.find((item: any) => item.category === transaction.category);
    if (existing) {
      existing.amount += transaction.amount;
    } else {
      acc.push({
        category: transaction.category,
        amount: transaction.amount,
        type: transaction.type
      });
    }
    return acc;
  }, []);

  // Data untuk grafik pemasukan vs pengeluaran per kategori
  const chartData = categoryData.map((item: any) => ({
    name: item.category,
    amount: item.amount,
    type: item.type
  }));

  // Warna untuk pie chart
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Data untuk grafik bulanan (dummy data untuk demo)
  const monthlyData = [
    { month: 'Jan', income: 5000000, expense: 3200000 },
    { month: 'Feb', income: 4800000, expense: 3500000 },
    { month: 'Mar', income: 6200000, expense: 4100000 },
    { month: 'Apr', income: 5500000, expense: 3800000 },
    { month: 'Mei', income: 6800000, expense: 4200000 },
    { month: 'Jun', income: 7200000, expense: 4500000 },
  ];

  const handleExportPDF = () => {
    alert('Fitur export PDF akan segera tersedia!');
  };

  const handleExportExcel = () => {
    alert('Fitur export Excel akan segera tersedia!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-600">Analisis dan ringkasan data keuangan</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportPDF}>
              📄 Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              📊 Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <span className="text-green-600 text-xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.income)}
            </div>
            <p className="text-xs text-gray-500">
              Periode {filterPeriod === 'weekly' ? 'mingguan' : filterPeriod === 'monthly' ? 'bulanan' : 'keseluruhan'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <span className="text-red-600 text-xl">💸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.expense)}
            </div>
            <p className="text-xs text-gray-500">
              Periode {filterPeriod === 'weekly' ? 'mingguan' : filterPeriod === 'monthly' ? 'bulanan' : 'keseluruhan'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keuntungan Bersih</CardTitle>
            <span className="text-blue-600 text-xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.net)}
            </div>
            <p className="text-xs text-gray-500">
              {summary.net >= 0 ? 'Profit' : 'Loss'} periode ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
            <span className="text-purple-600 text-xl">📋</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary.count}
            </div>
            <p className="text-xs text-gray-500">
              Total transaksi periode ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Bulanan</CardTitle>
            <CardDescription>
              Tren pemasukan dan pengeluaran 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
            <CardTitle>Distribusi per Kategori</CardTitle>
            <CardDescription>
              Pembagian transaksi berdasarkan kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Ringkasan per Kategori */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan per Kategori</CardTitle>
          <CardDescription>
            Detail transaksi berdasarkan kategori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-left py-3 px-4">Jenis</th>
                  <th className="text-left py-3 px-4">Total Nominal</th>
                  <th className="text-left py-3 px-4">Jumlah Transaksi</th>
                  <th className="text-left py-3 px-4">Rata-rata</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item: any, index: number) => {
                  const transactionCount = transactions.filter(t => t.category === item.category).length;
                  const average = item.amount / transactionCount;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.category}</td>
                      <td className="py-3 px-4">
                        <Badge variant={item.type === 'income' ? 'default' : 'secondary'}>
                          {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${
                          item.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{transactionCount}</td>
                      <td className="py-3 px-4">{formatCurrency(average)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
