
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/UserAvatar';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  status?: string;
  created_at: string;
  updated_at: string;
}

const Users: React.FC = () => {
  const { profile, createUser, updateUser, deleteUser, fetchUsers } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Hanya admin yang bisa mengakses halaman ini
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🚫</span>
              <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
              <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchUsers();
      
      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await createUser(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Pengguna baru berhasil ditambahkan",
      });

      setIsAddDialogOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'employee' });
      await loadUsers(); // Refresh list
    } catch (error: any) {
      console.error('Add user error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan pengguna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);

    try {
      const { error } = await updateUser(
        editingUser.id,
        formData.name,
        formData.role
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Data pengguna berhasil diperbarui",
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'employee' });
      await loadUsers(); // Refresh list
    } catch (error: any) {
      console.error('Edit user error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui pengguna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === profile?.id) {
      toast({
        title: "Error",
        description: "Anda tidak dapat menghapus akun sendiri!",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteUser(userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Pengguna berhasil dinonaktifkan",
      });

      await loadUsers(); // Refresh list
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus pengguna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600">Kelola akun pengguna sistem</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Pengguna</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi pengguna baru
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label htmlFor="add-name">Nama Lengkap</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan alamat email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="add-password">Password</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Masukkan password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="add-role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'admin' | 'employee') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Karyawan</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Tambah Pengguna'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui informasi pengguna
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
            </div>

            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'admin' | 'employee') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Karyawan</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
             <CardHeader>
               <div className="flex items-center space-x-4">
                 <UserAvatar 
                   userId={user.id}
                   userName={user.name}
                   role={user.role}
                   size="lg"
                   showName={false}
                 />
                 <div className="flex-1">
                   <CardTitle className="text-lg">{user.name}</CardTitle>
                   <CardDescription>{user.email}</CardDescription>
                 </div>
               </div>
             </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Administrator' : 'Karyawan'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge 
                    variant="outline" 
                    className={user.status === 'inactive' ? 'text-red-600 border-red-600' : 'text-green-600 border-green-600'}
                  >
                    {user.status === 'inactive' ? 'Nonaktif' : 'Aktif'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bergabung:</span>
                  <span className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {user.id !== profile?.id && (
                  <div className="pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => openEditDialog(user)}
                      >
                        Edit
                      </Button>
                       <Button 
                        size="sm" 
                        variant={user.status === 'inactive' ? 'outline' : 'destructive'}
                        className="flex-1"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.status === 'inactive'}
                      >
                        {user.status === 'inactive' ? 'Nonaktif' : 'Nonaktifkan'}
                      </Button>
                    </div>
                  </div>
                )}

                {user.id === profile?.id && (
                  <div className="pt-4 border-t">
                    <Badge variant="outline" className="w-full justify-center">
                      Akun Anda
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengguna</h3>
          <p className="text-gray-600">Tambahkan pengguna pertama untuk memulai.</p>
        </div>
      )}
    </div>
  );
};

export default Users;
