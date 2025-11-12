

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
}

// FIX: Wrap the Input component with forwardRef to allow it to receive a ref and pass it to the underlying input element.
const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, prefix, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-dark-text-secondary mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-text-secondary">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-dark-card border border-dark-border rounded-md shadow-sm 
            py-2 ${prefix ? 'pl-7' : 'px-3'}
            text-dark-text
            focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
            disabled:bg-gray-700 disabled:cursor-not-allowed
          `}
          ref={ref}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;