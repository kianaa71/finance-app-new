
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login: React.FC = () => {
  const { users, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      navigate('/dashboard');
    } else {
      setError('Email atau password salah');
    }
  };

  const quickLogin = (user: any) => {
    setCurrentUser(user);
    navigate('/dashboard');
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
            <CardTitle>Masuk ke Akun</CardTitle>
            <CardDescription>
              Masukkan email dan password untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Masuk
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Login Cepat (Demo)</CardTitle>
            <CardDescription>
              Klik salah satu untuk login langsung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.map(user => (
              <Button
                key={user.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => quickLogin(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                    user.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
