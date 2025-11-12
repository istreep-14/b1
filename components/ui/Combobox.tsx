import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Coworker } from '../../types';
import { CheckIcon, ChevronUpDownIcon } from '../Icons';
import Avatar from './Avatar';

interface ComboboxProps {
  label: string;
  items: Coworker[];
  selected: Coworker | null;
  onSelect: (item: Coworker) => void;
  onManualChange: (name: string) => void;
  initialValue?: string;
  disabled?: boolean;
}

const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(({ label, items, selected, onSelect, onManualChange, initialValue = '', disabled }, ref) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const preventBlur = useRef(false);

  useImperativeHandle(ref, () => inputRef.current!);
  
  useEffect(() => {
    if (selected) {
      setQuery('');
    } else {
      setQuery(initialValue);
    }
  }, [selected, initialValue]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredItems =
    query === ''
      ? items
      : items.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (item: Coworker) => {
    onSelect(item);
    setQuery('');
    setIsOpen(false);
    // Don't focus here, let the natural tab order flow
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex(prev => (prev + 1) % (filteredItems.length || 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
            handleSelect(filteredItems[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'Tab':
           if (isOpen && highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
              handleSelect(filteredItems[highlightedIndex]);
           }
           setIsOpen(false); // Close on tab out
           break;
      }
  }
  
  const displayValue = selected ? selected.name : query;

  return (
    <div className="relative" ref={wrapperRef}>
        <label className="block text-sm font-medium text-dark-text-secondary mb-1 sr-only">
          {label}
        </label>
        <div className="relative">
             {selected && (
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Avatar name={selected.name} imageUrl={selected.avatarUrl} size="sm" />
                </div>
            )}
            <input
                ref={inputRef}
                type="text"
                className={`w-full bg-dark-card border border-dark-border rounded-md shadow-sm py-2 pr-10 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent disabled:bg-gray-700 ${selected ? 'pl-11' : 'pl-3'}`}
                value={displayValue}
                onChange={(e) => { 
                    setQuery(e.target.value);
                    onManualChange(e.target.value);
                    setIsOpen(true);
                    setHighlightedIndex(0); // Auto-highlight first result on type
                }}
                onFocus={() => {
                  // Only open if the user intends to change the value, not just tab through
                  if (!displayValue) {
                      setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                autoComplete="off"
                placeholder="Select worker..."
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-2"
                onClick={() => setIsOpen(prev => !prev)}
                disabled={disabled}
            >
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </button>
        </div>

        {isOpen && (
            <ul 
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              onMouseDown={() => preventBlur.current = true}
              onMouseUp={() => preventBlur.current = false}
            >
            {filteredItems.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                Nothing found.
                </div>
            ) : (
                filteredItems.map((item, index) => (
                <li
                    key={item.id}
                    className={`relative cursor-default select-none py-2 pl-3 pr-9 transition-colors ${
                        highlightedIndex === index ? 'bg-dark-border' : 'text-dark-text'
                    }`}
                    onMouseMove={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(item)}
                >
                    <div className="flex items-center">
                        <Avatar name={item.name} imageUrl={item.avatarUrl} size="sm" />
                        <span className={`ml-3 block truncate ${selected?.id === item.id ? 'font-semibold' : 'font-normal'}`}>
                            {item.name}
                        </span>
                    </div>
                     {selected?.id === item.id && (
                        <span
                            className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                highlightedIndex === index ? 'text-white' : 'text-brand-accent'
                            }`}
                        >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                    )}
                </li>
                ))
            )}
            </ul>
        )}
    </div>
  );
});

export default Combobox;