import React, { useState, useEffect } from 'react';
import { ChefHat, MapPin, Package, Clock, Save, RotateCcw } from 'lucide-react';
import { AccessibilityAlert, SmartCombobox, InputRow} from '@components';

const RecipeCreationComponent = ({ recipeManager, className = "" }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    cycles: 1,
    output: { item: '', amount: 1 },
    input: [{ item: '', amount: 1 }]
  });

  const [alerts, setAlerts] = useState([]);
  const [errors, setErrors] = useState({});

  // Auto-generate recipe name when output item changes
  useEffect(() => {
    if (formData.output.item && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: `${formData.output.item} Production`
      }));
    }
  }, [formData.output.item]);

  // Add alert helper
  const addAlert = (message) => {
    setAlerts(prev => [...prev, message]);
    setTimeout(() => {
      setAlerts(prev => prev.slice(1));
    }, 4000);
  };

  // Handle new item added
  const handleNewItemAdded = (itemName) => {
    const result = recipeManager.addItem(itemName);
    if (result.success) {
      addAlert(`"${itemName}" added to items list`);
    }
  };

  // Handle new address added
  const handleNewAddressAdded = (addressName) => {
    const result = recipeManager.addAddress(addressName);
    if (result.success) {
      addAlert(`"${addressName}" added to addresses list`);
    }
  };

  // Update output
  const updateOutput = (field, value) => {
    setFormData(prev => ({
      ...prev,
      output: { ...prev.output, [field]: value }
    }));
  };

  // Update input - with auto-expansion logic
  const updateInput = (index, field, value) => {
    setFormData(prev => {
      const newInput = prev.input.map((input, i) => 
        i === index ? { ...input, [field]: value } : input
      );

      // Auto-expand: if user is typing in the last row and it's not empty, add a new row
      const isLastRow = index === prev.input.length - 1;
      const currentRow = newInput[index];
      const hasContent = currentRow.item;
      const canAddMore = newInput.length < 9;

      if (isLastRow && hasContent && canAddMore) {
        newInput.push({ item: '', amount: 1 });
      }

      return { ...prev, input: newInput };
    });
  };

  // Remove input row
  const removeInput = (index) => {
    if (formData.input.length > 1) {
      setFormData(prev => ({
        ...prev,
        input: prev.input.filter((_, i) => i !== index)
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.output.item) {
      newErrors.outputItem = 'Output item is required';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    if (formData.cycles <= 0) {
      newErrors.cycles = 'Cycles must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleConfirm = () => {
    if (!validateForm()) return;

    // Filter out empty input rows
    const cleanedInput = formData.input.filter(input => input.item.trim() !== '');

    const recipeData = {
      ...formData,
      name: formData.name || `${formData.output.item} Production`,
      input: cleanedInput
    };

    const result = recipeManager.addRecipe(recipeData);
    
    if (result.success) {
      addAlert(`Recipe "${recipeData.name}" created successfully!`);
      handleReset();
    } else {
      setErrors({ submit: result.error });
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      address: '',
      cycles: 1,
      output: { item: '', amount: 1 },
      input: [{ item: '', amount: 1 }]
    });
    setErrors({});
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ChefHat size={24} className="text-purple-600" />
        <h3 className="text-lg font-semibold">Create Recipe</h3>
      </div>

      {/* Output Section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Package size={16} />
          Output
        </h4>
        <div className="flex gap-4">
          <div className='flex-1'>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <SmartCombobox
              value={formData.output.item}
              onChange={(value) => updateOutput('item', value)}
              onNewItemAdded={handleNewItemAdded}
              suggestions={recipeManager.items}
              placeholder="Select or type item name"
            />
            {errors.outputItem && (
              <p className="text-red-600 text-sm mt-1">{errors.outputItem}</p>
            )}
          </div>
          <div className='w-32'>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              min="1"
              value={formData.output.amount}
              onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    updateOutput('amount', '');
                    return;
                  }
                  const amount = Math.max(1, parseInt(value) || 1);
                  updateOutput('amount', e.target.value)
                }
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
          <MapPin size={16} />
          Process
        </h4>
        <div className="flex gap-4">
          <div className='flex-1'>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <SmartCombobox
              value={formData.address}
              onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
              onNewItemAdded={handleNewAddressAdded}
              suggestions={recipeManager.addresses}
              placeholder="Select or type address"
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          <div className='w-32'>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Cycles *
            </label>
            <input
              type="number"
              min="1"
              value={formData.cycles}
              onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData(prev => ({
                      ...prev,
                      cycles: ''
                    }));
                    return;
                  }
                  const amount = Math.max(1, parseInt(value) || 1);
                  setFormData(prev => ({
                      ...prev,
                      cycles: amount
                    }));
                }
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.cycles && (
              <p className="text-red-600 text-sm mt-1">{errors.cycles}</p>
            )}
          </div>
        </div>
      </div>
      
      

      {/* Input Section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Input Items (optional - leave empty for generated items)
        </h4>
        <div className="space-y-3">
          {formData.input.map((input, index) => (
            <InputRow
              key={index}
              input={input}
              index={index}
              availableItems={recipeManager.items}
              onInputChange={updateInput}
              onRemove={removeInput}
              onNewItemAdded={handleNewItemAdded}
              showRemove={formData.input.length > 1}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Up to {9 - formData.input.length} more input{formData.input.length === 8 ? '' : 's'} can be added
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          onClick={handleConfirm}
          className=" flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Save size={16} />
          Confirm Recipe
        </button>
      </div>

      {/* Alerts Section */}
      <AccessibilityAlert alerts={alerts} />

      {/* Error Display */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {errors.submit}
        </div>
      )}
      
    </div>
  );
};

export default RecipeCreationComponent;