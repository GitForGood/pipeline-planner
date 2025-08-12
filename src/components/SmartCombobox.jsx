import React, { useState, useEffect, useRef } from 'react';

// Enhanced Smart Combobox Component with Keyboard Navigation
const SmartCombobox = ({ 
  value, 
  onChange, 
  onNewItemAdded,
  suggestions = [], 
  placeholder, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [originalValue, setOriginalValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Add "Add new" option if input doesn't match any suggestion
  const allOptions = [...filteredSuggestions];
  const isNewItem = inputValue && !suggestions.includes(inputValue);
  if (isNewItem) {
    allOptions.push(`ADD_NEW:${inputValue}`);
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1); // Reset highlight when typing
    setIsOpen(newValue.length > 0);
    
    // Store original value when user starts typing
    if (originalValue === '' && newValue !== value) {
      setOriginalValue(value);
    }
  };

  const selectOption = (option) => {
    if (option.startsWith('ADD_NEW:')) {
      const newItem = option.replace('ADD_NEW:', '');
      onNewItemAdded?.(newItem);
      onChange(newItem);
      setInputValue(newItem);
    } else {
      onChange(option);
      setInputValue(option);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
    setOriginalValue('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && inputValue.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : allOptions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < allOptions.length) {
          selectOption(allOptions[highlightedIndex]);
        } else if (allOptions.length > 0) {
          selectOption(allOptions[0]);
        } else {
          // No suggestions, just use current input
          onChange(inputValue);
          setIsOpen(false);
        }
        break;

      case 'Escape':
        e.preventDefault();
        // Restore original value if user cancels
        if (originalValue !== '') {
          setInputValue(originalValue);
          onChange(originalValue);
        }
        setIsOpen(false);
        setHighlightedIndex(-1);
        setOriginalValue('');
        inputRef.current?.blur();
        break;

      case 'Tab':
        // Allow tab to work normally, but close dropdown
        setIsOpen(false);
        setHighlightedIndex(-1);
        if (inputValue !== value) {
          onChange(inputValue);
        }
        break;

      default:
        // Reset highlight when user types
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow for option selection
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      
      // If user typed something new and didn't select from suggestions
      if (inputValue !== value) {
        if (isNewItem) {
          onNewItemAdded?.(inputValue);
        }
        onChange(inputValue);
      }
      
      setOriginalValue('');
    }, 150);
  };

  const handleOptionMouseDown = (option, index) => {
    setHighlightedIndex(index);
    selectOption(option);
  };

  const handleOptionMouseEnter = (index) => {
    setHighlightedIndex(index);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
      />
      
      {isOpen && allOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {allOptions.map((option, index) => {
            const isAddNew = option.startsWith('ADD_NEW:');
            const displayText = isAddNew ? option.replace('ADD_NEW:', '') : option;
            const isHighlighted = index === highlightedIndex;
            
            return (
              <div
                key={index}
                onMouseDown={() => handleOptionMouseDown(option, index)}
                onMouseEnter={() => handleOptionMouseEnter(index)}
                className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  isHighlighted 
                    ? isAddNew 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                    : isAddNew 
                      ? 'hover:bg-green-50 text-green-700' 
                      : 'hover:bg-blue-50'
                }`}
              >
                {isAddNew ? (
                  <>
                    <span className="text-sm">+ Add new: </span>
                    <strong>{displayText}</strong>
                  </>
                ) : (
                  displayText
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Keyboard hint */}
      {isOpen && allOptions.length > 0 && (
        <div className="absolute right-2 top-2 text-xs text-gray-400 pointer-events-none">
          ↑↓ Navigate • Enter Select • Esc Cancel
        </div>
      )}
    </div>
  );
};

export default SmartCombobox;