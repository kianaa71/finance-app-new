
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import AdminSidebar from './AdminSidebar';
import EmployeeTopbar from './EmployeeTopbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <>{children}</>;
  }

  if (currentUser.role === 'admin') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeTopbar />
      <main className="pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
