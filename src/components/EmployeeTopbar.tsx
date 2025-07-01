
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const EmployeeTopbar: React.FC = () => {
  const { currentUser, setCurrentUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/transactions', label: 'Transaksi' },
    { path: '/reports', label: 'Laporan' },
    { path: '/profile', label: 'Profil' },
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">FinanceApp</h1>
            <nav className="hidden md:flex space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {currentUser?.name.charAt(0)}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">Karyawan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTopbar;
