import { useState } from "react";

const ListViewComponent = ({ data, title = "Items" }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        setError(''); // Clear previous errors
        
        if (inputValue.trim()) {
            const result = data.add(inputValue);
            if (result.success) {
                setInputValue('');
            } else {
                setError(result.error);
            }
        }
    };

    const handleRemove = (item) => {
        setError('');
        const result = data.remove(item);
        if (!result.success) {
            setError(result.error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <div className="border p-4 rounded">
            <h2>{title} ({data.count})</h2>
            
            {/* Add new item */}
            <div className="mb-4">
                <label htmlFor={title}> Add {title} that you want to use</label>
                <input 
                    id={title}
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
                    className="border p-2 mr-2"
                />
                <button onClick={handleAdd} className="bg-blue-500 text-white p-2 rounded">
                    Add
                </button>
            </div>

            {/* Error display */}
            {error && (
                <div className="text-red-600 mb-2">{error}</div>
            )}
            
            {/* Existing items */}
            <div>
                <h3>Existing:</h3>
                {data.items.length === 0 ? (
                    <p className="text-gray-500">No {title.toLowerCase()} yet</p>
                ) : (
                    <ul className="space-y-1">
                        {data.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                <span>{item}</span>
                                <button 
                                    onClick={() => handleRemove(item)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default ListViewComponent;