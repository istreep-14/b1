import React from 'react';
import { CheckIcon } from '../Icons';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, name, checked, onChange, ...props }) => {
  const inputId = id || name;
  return (
    <label htmlFor={inputId} className="flex items-center space-x-3 cursor-pointer group">
      <div className="relative flex items-center justify-center w-5 h-5">
        <input
          id={inputId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        <div className={`w-5 h-5 rounded border-2 transition-all duration-150 ${checked ? 'bg-brand-primary border-brand-primary' : 'bg-dark-card border-dark-border group-hover:border-brand-accent'}`}>
        </div>
        {checked && (
          <CheckIcon className="w-4 h-4 text-white absolute" />
        )}
      </div>
      <span className="text-sm font-medium text-dark-text-secondary group-hover:text-dark-text transition-colors">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
