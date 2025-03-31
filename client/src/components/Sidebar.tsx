import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import UserProfile from './UserProfile';

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
}

interface SidebarProps {
  user: User | null;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut }) => {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      )
    },
    { 
      href: '/calories', 
      label: 'Calories', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5">
          <path d="M11 12H3v9h18v-9h-8" />
          <path d="M8 12V7c0-2.2 1.8-4 4-4s4 1.8 4 4v5" />
        </svg>
      )
    },
    { 
      href: '/weight', 
      label: 'Weight', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5">
          <path d="M6 18h12" />
          <path d="M6 14h12" />
          <path d="M6 10h12" />
          <path d="M6 6h12" />
        </svg>
      )
    },
    { 
      href: '/workouts', 
      label: 'Workouts', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5">
          <path d="M4 15v3c0 1.1.9 2 2 2h3" />
          <path d="M15 20h3c1.1 0 2-.9 2-2v-3" />
          <path d="M20 9V6c0-1.1-.9-2-2-2h-3" />
          <path d="M9 4H6c-1.1 0-2 .9-2 2v3" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    },
    { 
      href: '/statistics', 
      label: 'Statistics', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    }
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Lukie's Fit Track</h1>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                location === item.href 
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}>
                {item.icon}
                {item.label}
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      {user && <UserProfile user={user} onSignOut={onSignOut} />}
    </aside>
  );
};

export default Sidebar;
