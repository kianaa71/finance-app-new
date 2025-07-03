
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth: React.FC = () => {
  const { user, signIn, signUp, loading, createUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Redirect jika sudah login
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    setSelectedAvatar(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setSelectedAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAvatar = async (userId: string) => {
    if (!selectedAvatar) return;

    try {
      setUploadingAvatar(true);
      
      const fileExt = selectedAvatar.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedAvatar);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Warning",
        description: "Gagal mengupload foto profil, namun akun berhasil dibuat",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Login gagal",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Berhasil",
        description: "Login berhasil! Mengalihkan ke dashboard...",
      });

      // Navigate akan terjadi otomatis via useEffect karena user state berubah
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat login",
        variant: "destructive"
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await signUp(signupData.email, signupData.password, signupData.name);
      
      if (result.error) {
        toast({
          title: "Error", 
          description: result.error.message || "Registrasi gagal",
          variant: "destructive"
        });
        return;
      }

      // If there's an avatar selected and we got the user ID, upload it
      if (selectedAvatar && result.userId) {
        await uploadAvatar(result.userId);
      }

      toast({
        title: "Berhasil",
        description: "Registrasi berhasil! Silakan login dengan akun yang baru dibuat.",
      });

      // Reset form
      setSignupData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setSelectedAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Switch to login tab after successful registration
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      if (loginTab) {
        loginTab.click();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat registrasi",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">FinanceApp</h1>
          <p className="text-gray-600 mt-2">Sistem Pencatatan Keuangan Perusahaan</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selamat Datang</CardTitle>
            <CardDescription>
              Masuk ke akun Anda atau daftar untuk memulai
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Memproses...' : 'Masuk'}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">Cara menggunakan:</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>1. Daftar akun baru terlebih dahulu</div>
                    <div>2. Login dengan akun yang sudah dibuat</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nama Lengkap</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Nama Lengkap"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  {/* Avatar Upload */}
                  <div>
                    <Label htmlFor="avatar-upload">Foto Profil (Opsional)</Label>
                    <div className="flex flex-col items-center space-y-3 mt-2">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={avatarPreview || undefined} alt="Preview" />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xl">
                            {signupData.name ? signupData.name.charAt(0).toUpperCase() : '+'}
                          </AvatarFallback>
                        </Avatar>
                        {avatarPreview && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={removeAvatar}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="w-32"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Pilih Foto
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          Max 2MB, format JPG/PNG
                        </p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Password (minimal 6 karakter)"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-confirm-password">Konfirmasi Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Konfirmasi Password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Memproses...' : 'Daftar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
