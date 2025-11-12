import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out';
  
  const variantStyles = {
    primary: 'bg-brand-primary text-white hover:bg-brand-secondary focus:ring-brand-accent',
    secondary: 'bg-dark-border text-dark-text hover:bg-zinc-600 focus:ring-zinc-600',
    icon: 'bg-transparent text-dark-text-secondary hover:text-dark-text hover:bg-dark-border focus:ring-brand-accent',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const iconSizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const finalStyles = `
    ${baseStyles}
    ${variant === 'icon' ? iconSizeStyles[size] : sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `;

  return (
    <button className={finalStyles} {...props}>
      {children}
    </button>
  );
};

export default Button;