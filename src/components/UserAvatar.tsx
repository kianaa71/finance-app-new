import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserAvatar } from '@/hooks/useUserAvatar';

interface UserAvatarProps {
  userId: string;
  userName: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  userName, 
  role,
  size = 'sm', 
  showName = true,
  className = ''
}) => {
  const { avatarUrl } = useUserAvatar(userId);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const getBackgroundColor = (role?: string) => {
    return role === 'admin' ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || undefined} alt={userName} />
        <AvatarFallback className={`text-white font-semibold ${getBackgroundColor(role)} ${
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-xl'
        }`}>
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
          {userName}
        </span>
      )}
    </div>
  );
};