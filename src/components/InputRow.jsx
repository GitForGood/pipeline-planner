import { Trash2 } from "lucide-react";
import { SmartCombobox } from "@components";

// Input Row Component
const InputRow = ({ 
  input, 
  index, 
  availableItems, 
  onInputChange, 
  onRemove, 
  onNewItemAdded,
  showRemove = true 
}) => {
  const handleItemChange = (item) => {
    onInputChange(index, 'item', item);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    if (value === '') {
      onInputChange(index, 'amount', '');
      return;
    }
    
    const amount = Math.max(1, parseInt(value) || 1);
    onInputChange(index, 'amount', amount);
  };

  return (
    <div className="flex gap-4 items-center">
      <SmartCombobox
        value={input.item}
        onChange={handleItemChange}
        onNewItemAdded={onNewItemAdded}
        suggestions={availableItems}
        placeholder="Select or type item name"
        className="flex-1"
      />
      <div>
        <input
          type="number"
          min="1"
          value={input.amount}
          onChange={handleAmountChange}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Amount"
        />
      </div>
      {showRemove && (
        <button
          onClick={() => onRemove(index)}
          className="px-3 py-2 text-red-600 hover:bg-red-100 rounded transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default InputRow