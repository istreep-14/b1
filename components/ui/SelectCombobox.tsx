import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '../Icons';

interface SelectComboboxProps {
  label: string;
  items: readonly string[];
  selected: string | null;
  onSelect: (item: string) => void;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const SelectCombobox: React.FC<SelectComboboxProps> = ({ label, items, selected, onSelect, disabled, onKeyDown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: string) => {
    onSelect(item);
    setIsOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);

      if (e.defaultPrevented) {
          return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            handleSelect(items[highlightedIndex]);
          }
          break;
        case 'Escape':
        case 'Tab':
          setIsOpen(false);
          break;
      }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-dark-text-secondary mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full bg-dark-card border border-dark-border rounded-md shadow-sm py-2 pl-3 pr-10 text-left text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent disabled:bg-gray-700"
          onClick={() => setIsOpen(prev => !prev)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          <span className="block truncate capitalize">{selected || 'Select...'}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {items.map((item, index) => (
              <li
                key={item}
                className={`relative cursor-default select-none py-2 pl-3 pr-9 transition-colors ${
                  highlightedIndex === index ? 'bg-dark-border' : 'text-dark-text'
                }`}
                onMouseMove={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(item)}
              >
                <span className={`block truncate capitalize ${selected === item ? 'font-semibold' : 'font-normal'}`}>
                  {item}
                </span>
                {selected === item && (
                  <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${highlightedIndex === index ? 'text-white' : 'text-brand-accent'}`}>
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SelectCombobox;
