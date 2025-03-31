import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserProfileProps {
  user: User;
  onSignOut: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
  // Get user initials for avatar
  const getInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 bg-primary text-white">
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {user.fullName || user.username}
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
