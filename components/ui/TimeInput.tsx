import React, { useState, useEffect, forwardRef } from 'react';
import { parseTimeInput, formatTimeForDisplay } from '../../utils/time';
import Input from './Input';

interface TimeInputProps {
  label: string;
  value: string; // Should be in HH:MM format
  onChange: (value: string) => void;
  context?: 'start' | 'end';
  pairedValue?: string; // e.g., for an end time, this would be the start time
  required?: boolean;
  disabled?: boolean;
}

const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(({ label, value, onChange, context = 'start', pairedValue, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  // Internal value holds the user's raw input, which might not be formatted yet
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    // When the external value changes, update our internal one too
    setInternalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsFocused(false);
    const formattedTime = parseTimeInput(internalValue, context, pairedValue);
    if (formattedTime) {
      // If parsing is successful, call onChange with the formatted HH:MM value
      onChange(formattedTime);
    } else if (internalValue === '') {
      // If user cleared the input, propagate that change
      onChange('');
    }
    // If input is invalid but not empty, on next render useEffect will revert internalValue
    // back to the last known good 'value' from props.
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // When focusing, show the raw HH:MM value for easy editing
    setInternalValue(value); 
    e.target.select();
  }

  // Display 12hr format when not focused, and the raw internal value when focused
  const displayValue = isFocused ? internalValue : formatTimeForDisplay(value);

  return (
    <Input
      label={label}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder="e.g., 5p or 17:00"
      ref={ref}
      {...props}
    />
  );
});

export default TimeInput;
