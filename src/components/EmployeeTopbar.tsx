
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BarChart3, DollarSign, TrendingUp, Settings, LogOut } from 'lucide-react';

const EmployeeTopbar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { avatarUrl } = useUserAvatar(profile?.id);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transaksi', icon: DollarSign },
    { path: '/reports', label: 'Laporan', icon: TrendingUp },
    { path: '/profile', label: 'Profil', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-card shadow-md border-b border-border z-50">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold">FinanceApp</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarUrl || undefined} alt={profile?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {profile?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{profile?.name}</p>
                <p className="text-xs text-muted-foreground">Karyawan</p>
              </div>
            </div>

            {/* Desktop Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <div className="flex items-center gap-3 mb-6">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={avatarUrl || undefined} alt={profile?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {profile?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile?.name}</p>
                        <p className="text-xs text-muted-foreground">Karyawan</p>
                      </div>
                    </div>
                    
                    <nav className="space-y-2">
                      {menuItems.map((item) => (
                        <Button
                          key={item.path}
                          variant={location.pathname === item.path ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => handleNavigate(item.path)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTopbar;
