import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

// FIX: Wrap the Select component with forwardRef to allow it to receive a ref and pass it to the underlying select element.
const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, id, children, ...props }, ref) => {
  const selectId = id || props.name;
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-dark-text-secondary mb-1">
        {label}
      </label>
      <select
        id={selectId}
        className={`
          w-full bg-dark-card border border-dark-border rounded-md shadow-sm 
          py-2 px-3
          text-dark-text
          focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent
        `}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});

Select.displayName = 'Select';

export default Select;