import React from 'react';
import { User } from '@/types';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onSignOut: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut }) => {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <Sidebar user={user} onSignOut={onSignOut} />
      <MobileNav user={user} onSignOut={onSignOut} />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 md:p-8 p-4 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
