
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Redirect jika sudah login
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      const { error } = await signUp(signupData.email, signupData.password, signupData.name);
      
      if (error) {
        toast({
          title: "Error", 
          description: error.message || "Registrasi gagal",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Berhasil",
        description: "Registrasi berhasil! Silakan cek email untuk konfirmasi.",
      });

      // Reset form
      setSignupData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
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
            <CardTitle>Mode Testing</CardTitle>
            <CardDescription>
              Aplikasi sedang dalam mode testing. Autentikasi dinonaktifkan sementara.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6">
              <p className="text-lg mb-4">🧪 Mode Testing Aktif</p>
              <p className="text-gray-600 mb-4">
                Anda dapat mengakses semua fitur sebagai admin tanpa login.
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="w-full"
              >
                Masuk ke Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
