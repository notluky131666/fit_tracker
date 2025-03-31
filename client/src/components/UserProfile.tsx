import React from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserProfileProps {
  user: SupabaseUser;
  onSignOut: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
  // Get user initials for avatar
  const getInitials = () => {
    // Supabase user may have user_metadata with additional info
    const name = user.user_metadata?.full_name || user.email;
    if (name) {
      return name
        .split(/[ @]/) // Split by space or @ (for email)
        .map((part: string) => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'U'; // Default fallback
  };

  // Display name is either from metadata or email
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 bg-primary text-white">
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {displayName}
          </p>
          <Button 
            variant="link" 
            className="text-xs font-medium text-gray-500 hover:text-gray-700 p-0"
            onClick={onSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
