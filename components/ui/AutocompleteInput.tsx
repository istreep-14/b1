import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Coworker } from '../../types';
import Input from './Input';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onSelect: (coworker: Coworker) => void;
  suggestions: Coworker[];
  onManualChange: (value: string) => void;
  onEnterOrTab?: () => void;
  disabled?: boolean;
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(({ label, value, onSelect, suggestions, onManualChange, onEnterOrTab, disabled }, ref) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      inputValue.length > 0 &&
      suggestion.name.toLowerCase() !== inputValue.toLowerCase()
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onManualChange(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (coworker: Coworker) => {
    setInputValue(coworker.name);
    onSelect(coworker);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightedIndex]);
        onEnterOrTab?.();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input 
        label={label}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
        ref={ref}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-dark-card border border-dark-border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              onMouseOver={() => setHighlightedIndex(index)}
              className={`px-3 py-2 cursor-pointer ${highlightedIndex === index ? 'bg-dark-border' : ''}`}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default AutocompleteInput;
