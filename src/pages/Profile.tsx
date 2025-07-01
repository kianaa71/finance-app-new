
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Profile: React.FC = () => {
  const { currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi save
    alert('Profil berhasil diperbarui!');
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }
    alert('Password berhasil diubah!');
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
        <p className="text-gray-600">Kelola informasi akun dan keamanan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Akun */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
              <CardDescription>
                Update informasi dasar akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  {!isEditing ? (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Profil
                    </Button>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit">
                        Simpan Perubahan
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>
                Pastikan akun Anda tetap aman dengan password yang kuat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Masukkan password saat ini"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-password">Password Baru</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Masukkan password baru"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Konfirmasi password baru"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Informasi */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                    currentUser?.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{currentUser?.name}</p>
                    <p className="text-gray-600">{currentUser?.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Role:</span>
                    <Badge variant={currentUser?.role === 'admin' ? 'default' : 'secondary'}>
                      {currentUser?.role === 'admin' ? 'Administrator' : 'Karyawan'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">User ID:</span>
                    <span className="text-sm font-mono">{currentUser?.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Aktif
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hak Akses</CardTitle>
              <CardDescription>
                Fitur yang dapat Anda akses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentUser?.role === 'admin' ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-lg">✅</span>
                      <span className="text-sm">Kelola semua transaksi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-lg">✅</span>
                      <span className="text-sm">Manajemen pengguna</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-lg">✅</span>
                      <span className="text-sm">Laporan lengkap</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-lg">✅</span>
                      <span className="text-sm">Export data</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-lg">✅</span>
                      <span className="text-sm">Lihat semua transaksi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-lg">✅</span>
                      <span className="text-sm">Tambah transaksi baru</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-lg">✅</span>
                      <span className="text-sm">Edit transaksi sendiri</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-500 text-lg">⚠️</span>
                      <span className="text-sm">Terbatas pada data sendiri</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
