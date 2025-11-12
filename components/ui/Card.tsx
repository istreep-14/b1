
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-dark-card shadow-lg rounded-lg p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
