import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload } from 'lucide-react';

const Profile: React.FC = () => {
  const { profile, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load existing avatar on mount
  React.useEffect(() => {
    if (profile?.id) {
      loadAvatar();
    }
  }, [profile?.id]);

  const loadAvatar = async () => {
    if (!profile?.id) return;
    
    try {
      console.log('Profile: Loading avatar for user:', profile.id);
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .list(profile.id, { limit: 10 });
        
      console.log('Profile: Avatar files found:', data, 'Error:', error);
        
      if (data && data.length > 0) {
        // Sort by updated_at to get the most recent file
        const sortedFiles = data.sort((a, b) => 
          new Date(b.updated_at || b.created_at).getTime() - 
          new Date(a.updated_at || a.created_at).getTime()
        );
        
        const filePath = `${profile.id}/${sortedFiles[0].name}`;
        console.log('Profile: Getting public URL for:', filePath);
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        console.log('Profile: Avatar public URL:', publicUrl);
        setAvatarUrl(publicUrl);
      } else {
        console.log('Profile: No avatar files found for user:', profile.id);
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Profile: Error loading avatar:', error);
      setAvatarUrl(null);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Ukuran file maksimal 2MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      // Delete existing avatar if any
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(profile.id);
        
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${profile.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diperbarui",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengupload foto profil",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await updateUser(profile.id, formData.name, profile.role);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak cocok!",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password baru minimal 6 karakter!",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Password berhasil diubah",
      });

      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
                      disabled={true}
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
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
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ ...formData, name: profile?.name || '' });
                        }}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-password">Password Baru</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Masukkan password baru"
                      minLength={6}
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
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Mengubah...' : 'Update Password'}
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
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={avatarUrl || undefined} alt={profile?.name} />
                      <AvatarFallback className={`text-white font-bold text-xl ${
                        profile?.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {profile?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">{profile?.name}</p>
                    <p className="text-gray-600">{profile?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Klik ikon kamera untuk mengubah foto</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Role:</span>
                    <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                      {profile?.role === 'admin' ? 'Administrator' : 'Karyawan'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">User ID:</span>
                    <span className="text-sm font-mono text-xs">{profile?.id}</span>
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
                {profile?.role === 'admin' ? (
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