import React from 'react';
import { getAvatarColor } from '../../utils/color';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 'md', className = '' }) => {
  const getInitials = (nameStr: string) => {
    if (!nameStr) return '?';
    const names = nameStr.split(' ');
    if (names.length > 1 && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const colorClass = getAvatarColor(name);

  return (
    <div className={`relative inline-block flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      {imageUrl ? (
        <img className="h-full w-full rounded-full object-cover" src={imageUrl} alt={name} />
      ) : (
        <div className={`h-full w-full rounded-full flex items-center justify-center font-bold text-white ${colorClass}`}>
          <span>{getInitials(name)}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
