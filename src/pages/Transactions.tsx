import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Transactions: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: ''
  });

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

      // Load profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) throw profileError;

      setTransactions((transactionData || []) as Transaction[]);
      setCategories(categoryData || []);
      setProfiles(profileData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data transaksi",
        variant: "destructive"
      });
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

  const canEditTransaction = (transaction: Transaction) => {
    if (profile?.role === 'admin') return true;
    return transaction.user_id === profile?.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        category_id: formData.category_id,
        user_id: profile?.id
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Transaksi berhasil diperbarui",
        });
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Transaksi berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      setEditingTransaction(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        category_id: ''
      });
      await loadData();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan transaksi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category_id: transaction.category_id
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus",
      });

      await loadData();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus transaksi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Tidak diketahui';
  };

  const getUserName = (userId: string) => {
    const user = profiles.find(p => p.id === userId);
    return user?.name || 'Tidak diketahui';
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-600">Kelola semua transaksi keuangan</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Transaksi</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
              </DialogTitle>
              <DialogDescription>
                Masukkan detail transaksi dengan lengkap
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Tanggal</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Jenis</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value, category_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi transaksi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Nominal</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(c => c.type === formData.type)
                        .map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : (editingTransaction ? 'Update' : 'Simpan')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            Semua transaksi yang telah dicatat dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tanggal</th>
                  <th className="text-left py-3 px-4">Deskripsi</th>
                  <th className="text-left py-3 px-4">Nominal</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-left py-3 px-4">Pengguna</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                          {getCategoryName(transaction.category_id)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                            {getUserName(transaction.user_id).charAt(0)}
                          </div>
                          <span className="text-sm">{getUserName(transaction.user_id)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {canEditTransaction(transaction) ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(transaction)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Tidak dapat diubah</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Belum ada transaksi yang dicatat
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

export default Transactions;