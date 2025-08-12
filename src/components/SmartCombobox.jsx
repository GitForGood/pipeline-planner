import React, { useState, useEffect } from 'react';


// Smart Combobox Component
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

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      // If the input value doesn't exist in suggestions and is not empty, it's a new item
      if (inputValue && !suggestions.includes(inputValue)) {
        onNewItemAdded?.(inputValue);
      }
      onChange(inputValue);
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        // Select first suggestion
        handleSuggestionClick(filteredSuggestions[0]);
      } else if (inputValue && !suggestions.includes(inputValue)) {
        // Add new item
        onNewItemAdded?.(inputValue);
        onChange(inputValue);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(inputValue.length > 0)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {isOpen && (filteredSuggestions.length > 0 || inputValue) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
            >
              {suggestion}
            </div>
          ))}
          
          {/* Add new item option */}
          {inputValue && !suggestions.includes(inputValue) && (
            <div
              onMouseDown={() => {
                onNewItemAdded?.(inputValue);
                onChange(inputValue);
                setIsOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-green-50 border-t border-gray-200 bg-green-25 text-green-700"
            >
              <span className="text-sm">+ Add new: </span>
              <strong>{inputValue}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartCombobox;