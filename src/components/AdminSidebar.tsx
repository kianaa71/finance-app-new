
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { BarChart3, DollarSign, FolderOpen, TrendingUp, Users, Settings, LogOut } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { avatarUrl } = useUserAvatar(profile?.id);
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transaksi', icon: DollarSign },
    { path: '/categories', label: 'Kategori', icon: FolderOpen },
    { path: '/reports', label: 'Laporan', icon: TrendingUp },
    { path: '/users', label: 'Pengguna', icon: Users },
    { path: '/profile', label: 'Profil', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <SidebarTrigger className="bg-card shadow-md" />
      </div>
      
      <Sidebar className="border-r border-border">
        <SidebarHeader className="border-b border-border">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            {state === 'expanded' && (
              <div>
                <p className="text-sm font-semibold">FinanceApp</p>
                <p className="text-xs text-muted-foreground">Sistem Keuangan</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* User Profile */}
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl || undefined} alt={profile?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {profile?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {state === 'expanded' && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile?.name}</p>
                    <p className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md inline-block">
                      Administrator
                    </p>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      tooltip={state === 'collapsed' ? item.label : undefined}
                    >
                      <button
                        onClick={() => navigate(item.path)}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={state === 'collapsed' ? 'Keluar' : undefined}
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AdminSidebar;
