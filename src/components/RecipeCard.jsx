import { useState } from 'react';
import { Edit, Save, X, Trash2, Copy,  ArrowRight, MapPin, Clock } from 'lucide-react';

// Compact Recipe Card Component
const RecipeCard = ({ 
  recipe, 
  availableItems, 
  availableAddresses, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(recipe);
  const [errors, setErrors] = useState({});

  const handleEdit = () => {
    setEditData(recipe);
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setEditData(recipe);
    setIsEditing(false);
    setErrors({});
  };

  const validateEdit = () => {
    const newErrors = {};
    
    if (!editData.name?.trim()) {
      newErrors.name = 'Recipe name required';
    }
    
    if (!editData.address) {
      newErrors.address = 'Address required';
    }
    
    if (!editData.output?.item) {
      newErrors.outputItem = 'Output item required';
    }
    
    if (!editData.output?.amount || editData.output.amount <= 0) {
      newErrors.outputAmount = 'Output amount must be > 0';
    }
    
    if (!editData.cycles || editData.cycles <= 0) {
      newErrors.cycles = 'Cycles must be > 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateEdit()) {
      // Filter out empty input rows
      const cleanedInput = editData.input?.filter(input => input.item?.trim()) || [];
      
      const updatedRecipe = {
        ...editData,
        input: cleanedInput,
        name: editData.name.trim()
      };
      
      onUpdate(recipe.id, updatedRecipe);
      setIsEditing(false);
    }
  };

  const updateEditData = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const updateEditOutput = (field, value) => {
    setEditData(prev => ({
      ...prev,
      output: { ...prev.output, [field]: value }
    }));
  };

  const updateEditInput = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      input: prev.input.map((input, i) => 
        i === index ? { ...input, [field]: value } : input
      )
    }));
  };

  const addEditInput = () => {
    setEditData(prev => ({
      ...prev,
      input: [...(prev.input || []), { item: '', amount: 1 }]
    }));
  };

  const removeEditInput = (index) => {
    setEditData(prev => ({
      ...prev,
      input: prev.input.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = () => {
    if (confirm(`Delete recipe "${recipe.name}"?`)) {
      onDelete(recipe.id);
    }
  };

  const handleDuplicate = () => {
    onDuplicate(recipe.id);
  };

  if (isEditing) {
    return (
      <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
        <div className="space-y-4">
          {/* Recipe Name */}
          <div>
            <input
              type="text"
              value={editData.name || ''}
              onChange={(e) => updateEditData('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-lg font-semibold ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Recipe name"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
            <div className="flex gap-2">
              <select
                value={editData.output?.item || ''}
                onChange={(e) => updateEditOutput('item', e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md ${
                  errors.outputItem ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select item</option>
                {availableItems.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={editData.output?.amount || 1}
                onChange={(e) => updateEditOutput('amount', parseInt(e.target.value) || 1)}
                className={`w-20 px-3 py-2 border rounded-md ${
                  errors.outputAmount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {(errors.outputItem || errors.outputAmount) && (
              <p className="text-red-600 text-sm mt-1">
                {errors.outputItem || errors.outputAmount}
              </p>
            )}
          </div>

          {/* Address & Cycles */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <select
                value={editData.address || ''}
                onChange={(e) => updateEditData('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select address</option>
                {availableAddresses.map(addr => (
                  <option key={addr} value={addr}>{addr}</option>
                ))}
              </select>
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cycles</label>
              <input
                type="number"
                min="1"
                value={editData.cycles || 1}
                onChange={(e) => updateEditData('cycles', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.cycles ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cycles && <p className="text-red-600 text-sm mt-1">{errors.cycles}</p>}
            </div>
          </div>

          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inputs (optional)
            </label>
            <div className="space-y-2">
              {(editData.input || []).map((input, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={input.item || ''}
                    onChange={(e) => updateEditInput(index, 'item', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select item</option>
                    {availableItems.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={input.amount || 1}
                    onChange={(e) => updateEditInput(index, 'amount', parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => removeEditInput(index)}
                    className="px-2 py-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addEditInput}
                className="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded text-sm"
              >
                + Add Input
              </button>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-2 pt-2 border-t border-blue-200">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display Mode
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-lg text-gray-800 flex-1">{recipe.name}</h4>
        <div className="flex gap-1 ml-2">
          <button
            onClick={handleEdit}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit recipe"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Duplicate recipe"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Delete recipe"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Recipe Flow */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-3">
        {/* Inputs */}
        <div className="flex-1">
          {recipe.input && recipe.input.length > 0 ? (
            <div className="space-y-1">
              {recipe.input.map((input, index) => (
                <div key={index} className="text-sm text-gray-700">
                  <span className="font-medium">{input.item}</span>
                  <span className="text-gray-500"> ×{input.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Generated item
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="px-4">
          <ArrowRight size={20} className="text-gray-400" />
        </div>

        {/* Output */}
        <div className="text-right">
          <div className="text-lg font-semibold text-green-700">
            {recipe.output.item}
          </div>
          <div className="text-sm text-gray-600">
            ×{recipe.output.amount}
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{recipe.address}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{recipe.cycles} cycle{recipe.cycles !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;