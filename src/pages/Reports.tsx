import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category_id: string;
  user_id: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

const Reports: React.FC = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('monthly');

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      // Load transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Load categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*');

      if (categoryError) throw categoryError;

      setTransactions((transactionData || []) as Transaction[]);
      setCategories(categoryData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense, net: income - expense, count: filteredTransactions.length };
  };

  const summary = calculateSummary();

  // Data untuk grafik kategori
  const categoryData = transactions.reduce((acc: any, transaction) => {
    const category = categories.find(c => c.id === transaction.category_id);
    const categoryName = category?.name || 'Tidak diketahui';
    
    const existing = acc.find((item: any) => item.category === categoryName);
    if (existing) {
      existing.amount += Number(transaction.amount);
    } else {
      acc.push({
        category: categoryName,
        amount: Number(transaction.amount),
        type: transaction.type
      });
    }
    return acc;
  }, []);

  // Warna untuk pie chart
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Data untuk grafik bulanan (berdasarkan 6 bulan terakhir)
  const getMonthlyData = () => {
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('id-ID', { month: 'short' });
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month.getMonth() && 
               transactionDate.getFullYear() === month.getFullYear();
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      monthlyData.push({ month: monthName, income, expense });
    }
    
    return monthlyData;
  };

  const monthlyData = getMonthlyData();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN KEUANGAN', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('FinanceApp - Sistem Keuangan', 105, 30, { align: 'center' });
    doc.text(`Tanggal Cetak: ${currentDate}`, 105, 40, { align: 'center' });
    
    const periodText = filterPeriod === 'weekly' ? 'Mingguan' : 
                      filterPeriod === 'monthly' ? 'Bulanan' : 'Keseluruhan';
    doc.text(`Periode: ${periodText}`, 105, 50, { align: 'center' });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
    
    let yPosition = 70;
    
    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN KEUANGAN', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Total Pemasukan', formatCurrency(summary.income)],
      ['Total Pengeluaran', formatCurrency(summary.expense)],
      ['Keuntungan Bersih', formatCurrency(summary.net)],
      ['Jumlah Transaksi', summary.count.toString()]
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Kategori', 'Nilai']],
      body: summaryData,
      theme: 'grid',
      margin: { left: 45 }, // Center the table
      tableWidth: 120,
      headStyles: { 
        fillColor: [16, 185, 129], // Green
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 10,
        textColor: [31, 41, 55] // Dark gray
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246] // Light gray
      },
      columnStyles: {
        0: { cellWidth: 60, halign: 'center' },
        1: { cellWidth: 60, halign: 'center' }
      }
    });
    
    yPosition += summaryData.length * 12 + 40; // Estimate table height
    
    // Monthly Data Section
    if (monthlyData.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TREN BULANAN (6 BULAN TERAKHIR)', 20, yPosition);
      yPosition += 10;
      
      const monthlyTableData = monthlyData.map(item => [
        item.month,
        formatCurrency(item.income),
        formatCurrency(item.expense),
        formatCurrency(item.income - item.expense)
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Bulan', 'Pemasukan', 'Pengeluaran', 'Selisih']],
        body: monthlyTableData,
        theme: 'grid',
        margin: { left: 25 }, // Center the table
        tableWidth: 160,
        headStyles: { 
          fillColor: [59, 130, 246], // Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [239, 246, 255] // Light blue
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },
          1: { cellWidth: 45, halign: 'center' },
          2: { cellWidth: 45, halign: 'center' },
          3: { cellWidth: 40, halign: 'center' }
        }
      });
      
      yPosition += monthlyTableData.length * 12 + 40; // Estimate table height
    }
    
    // Category Breakdown Section
    if (categoryData.length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RINGKASAN PER KATEGORI', 20, yPosition);
      yPosition += 10;
      
      const categoryTableData = categoryData.map((item: any) => {
        const transactionCount = transactions.filter(t => {
          const transactionCategory = categories.find(c => c.id === t.category_id);
          return transactionCategory?.name === item.category;
        }).length;
        const average = transactionCount > 0 ? item.amount / transactionCount : 0;
        
        return [
          item.category,
          item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          formatCurrency(item.amount),
          transactionCount.toString(),
          formatCurrency(average)
        ];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Kategori', 'Jenis', 'Total Nominal', 'Jumlah Transaksi', 'Rata-rata']],
        body: categoryTableData,
        theme: 'grid',
        margin: { left: 10 }, // Center the table
        tableWidth: 190,
        headStyles: { 
          fillColor: [139, 92, 246], // Purple
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { 
          fontSize: 9,
          textColor: [31, 41, 55]
        },
        alternateRowStyles: {
          fillColor: [250, 245, 255] // Light purple
        },
        columnStyles: {
          0: { cellWidth: 40, halign: 'center' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 45, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' },
          4: { cellWidth: 45, halign: 'center' }
        }
      });
    }
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('Laporan ini dibuat secara otomatis oleh FinanceApp', 105, 290, { align: 'center' });
    }
    
    // Save the PDF
    const fileName = `Laporan_Keuangan_${periodText}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleExportExcel = () => {
    alert('Fitur export Excel akan segera tersedia!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

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
                {categoryData.length > 0 ? (
                  categoryData.map((item: any, index: number) => {
                    const category = categories.find(c => c.name === item.category);
                    const transactionCount = transactions.filter(t => {
                      const transactionCategory = categories.find(c => c.id === t.category_id);
                      return transactionCategory?.name === item.category;
                    }).length;
                    const average = transactionCount > 0 ? item.amount / transactionCount : 0;
                    
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
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Belum ada data untuk ditampilkan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;