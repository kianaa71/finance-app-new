
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Settings, Loader2 } from 'lucide-react';

const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSetupAdmin = async () => {
    setLoading(true);
    
    try {
      console.log('🚀 Calling setup-admin function...');
      
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: {}
      });

      console.log('📡 Function response:', { data, error });

      if (error) {
        console.error('❌ Function error:', error);
        toast({
          title: "Setup Gagal",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        setSuccess(true);
        toast({
          title: "Setup Berhasil! 🎉",
          description: "Admin user berhasil dibuat. Silakan refresh halaman dan login.",
        });
      } else {
        toast({
          title: "Setup Gagal",
          description: data?.message || "Terjadi kesalahan saat setup admin",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('💥 Setup error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat setup admin user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-700">Setup Berhasil!</CardTitle>
          <CardDescription>
            Admin user telah berhasil dibuat
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">Kredensial Admin:</p>
            <div className="text-sm text-green-700 space-y-1">
              <div><strong>Email:</strong> admin@financeapp.com</div>
              <div><strong>Password:</strong> admin123</div>
            </div>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Refresh & Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Settings className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <CardTitle>Setup Admin User</CardTitle>
        <CardDescription>
          Buat user admin pertama untuk mengakses sistem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Yang akan dibuat:</p>
              <ul className="space-y-1 text-xs">
                <li>• Email: admin@financeapp.com</li>
                <li>• Password: admin123</li>
                <li>• Role: Administrator</li>
              </ul>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSetupAdmin}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sedang Setup...
            </>
          ) : (
            'Setup Admin User'
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Tombol ini hanya bisa digunakan sekali. Setelah admin dibuat, 
          gunakan kredensial di atas untuk login.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
