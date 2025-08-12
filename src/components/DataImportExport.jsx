import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

const DataImportExport = ({ recipeManager, className = "" }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // 'success', 'error', or null
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef(null);

  // Export functionality
  const handleExport = () => {
    try {
      const dataToExport = recipeManager.exportData();
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `recipe-data-${timestamp}.json`;
      
      // Create and download file
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      setImportStatus('success');
      setImportMessage(`Data exported successfully as ${filename}`);
      setTimeout(() => setImportStatus(null), 3000);
      
    } catch (error) {
      setImportStatus('error');
      setImportMessage(`Export failed: ${error.message}`);
      setTimeout(() => setImportStatus(null), 5000);
    }
  };

  // Import functionality
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportStatus('error');
      setImportMessage('Please select a valid JSON file');
      setTimeout(() => setImportStatus(null), 5000);
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Validate JSON structure
        const validationResult = validateImportData(jsonData);
        if (!validationResult.valid) {
          throw new Error(validationResult.error);
        }

        // Import the data
        const result = recipeManager.importData(jsonData);
        
        if (result.success) {
          setImportStatus('success');
          setImportMessage(`Data imported successfully! Loaded ${jsonData.items?.length || 0} items, ${jsonData.addresses?.length || 0} addresses, and ${jsonData.recipes?.length || 0} recipes.`);
        } else {
          throw new Error(result.error);
        }
        
      } catch (error) {
        setImportStatus('error');
        setImportMessage(`Import failed: ${error.message}`);
      } finally {
        setIsImporting(false);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => setImportStatus(null), 5000);
      }
    };

    reader.onerror = () => {
      setIsImporting(false);
      setImportStatus('error');
      setImportMessage('Failed to read file');
      setTimeout(() => setImportStatus(null), 5000);
    };

    reader.readAsText(file);
  };

  // Validate imported data structure
  const validateImportData = (data) => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid JSON structure' };
    }

    // Check if required fields exist and are arrays
    const requiredArrayFields = ['items', 'addresses', 'recipes'];
    for (const field of requiredArrayFields) {
      if (data[field] && !Array.isArray(data[field])) {
        return { valid: false, error: `Field '${field}' must be an array` };
      }
    }

    // Validate recipes structure if recipes exist
    if (data.recipes && data.recipes.length > 0) {
      for (const recipe of data.recipes) {
        if (!recipe.name || !recipe.address || !recipe.output || !recipe.input) {
          return { valid: false, error: 'Invalid recipe structure - missing required fields' };
        }
        
        if (!Array.isArray(recipe.input)) {
          return { valid: false, error: 'Recipe input must be an array' };
        }
      }
    }

    return { valid: true };
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear status message
  const clearStatus = () => {
    setImportStatus(null);
    setImportMessage('');
  };

  // Get current data stats
  const dataStats = recipeManager.getStats();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FileText size={24} className="text-indigo-600" />
        <h2 className="text-xl font-semibold">Data Management</h2>
      </div>

      {/* Status Message */}
      {importStatus && (
        <div className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${
          importStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {importStatus === 'success' ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className="flex-1">{importMessage}</span>
          <button onClick={clearStatus} className="text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Current Data Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Current Data</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{dataStats.totalItems}</div>
            <div className="text-sm text-gray-600">Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{dataStats.totalAddresses}</div>
            <div className="text-sm text-gray-600">Addresses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{dataStats.totalRecipes}</div>
            <div className="text-sm text-gray-600">Recipes</div>
          </div>
        </div>
      </div>

      {/* Import/Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={dataStats.totalItems === 0 && dataStats.totalAddresses === 0 && dataStats.totalRecipes === 0}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={20} />
          <span>Export Data</span>
        </button>

        {/* Import Button */}
        <button
          onClick={triggerFileInput}
          disabled={isImporting}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={20} />
          <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Import Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Import Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Select a JSON file exported from this application</li>
          <li>• Importing will replace all current data</li>
          <li>• Make sure to export your current data first if you want to keep it</li>
          <li>• The file must contain valid recipe data structure</li>
        </ul>
      </div>

      {/* Export Info */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">Export Information:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Downloads a JSON file with all your current data</li>
          <li>• Includes items, addresses, recipes, and metadata</li>
          <li>• File is named with current date for easy organization</li>
          <li>• Can be imported back into this application anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default DataImportExport;