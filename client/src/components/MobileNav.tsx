import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { User as SupabaseUser } from '@supabase/supabase-js';
import UserProfile from './UserProfile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
}

interface MobileNavProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ user, onSignOut }) => {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M11 12H3v9h18v-9h-8" />
          <path d="M8 12V7c0-2.2 1.8-4 4-4s4 1.8 4 4v5" />
        </svg>
      )
    },
    { 
      href: '/weight', 
      label: 'Weight', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    }
  ];

  // Bottom navigation for mobile
  const renderBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center z-10">
      {navItems.map(item => (
        <Link key={item.href} href={item.href}>
          <a className={cn(
            "flex flex-col items-center p-3",
            location === item.href ? "text-primary" : "text-gray-500"
          )}>
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        </Link>
      ))}
    </div>
  );

  // Top mobile header and slide-out menu
  const renderTopNav = () => (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <h1 className="text-xl font-bold text-primary">Lukie's Fit Track</h1>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Lukie's Fit Track</h1>
          </div>
          
          <nav className="flex-1 px-4 pb-4">
            <div className="space-y-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                      location === item.href 
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </nav>
          
          {user && <UserProfile user={user} onSignOut={() => { onSignOut(); setOpen(false); }} />}
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      {renderTopNav()}
      {renderBottomNav()}
    </>
  );
};

export default MobileNav;
