
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AdminSidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transaksi', icon: '💰' },
    { path: '/categories', label: 'Kategori', icon: '📂' },
    { path: '/reports', label: 'Laporan', icon: '📈' },
    { path: '/users', label: 'Pengguna', icon: '👥' },
    { path: '/profile', label: 'Profil', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">FinanceApp</h1>
        <p className="text-sm text-gray-600 mt-1">Sistem Keuangan</p>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {profile?.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{profile?.name}</p>
            <p className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
              Administrator
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
              location.pathname === item.path
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
