// useRecipeManager.js
import { useState, useEffect } from 'react';

const useRecipeManager = (initialData = null, options = {}) => {
  const {
    onDataChange = null,
    autoGenerateIds = true,
    validateRecipes = true
  } = options;

  // Main data structure
  const [data, setData] = useState({
    items: [],
    addresses: [],
    recipes: [],
    metadata: {
      created: new Date().toISOString(),
      version: '1.0',
      lastModified: new Date().toISOString()
    },
    ...initialData
  });

  // Update metadata when data changes
  useEffect(() => {
    setData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
  }, [data.items, data.addresses, data.recipes]);

  // Notify parent of changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(data);
    }
  }, [data, onDataChange]);

  // Sync with external data changes (e.g., from JSON import)
  useEffect(() => {
    if (initialData) {
      setData(prev => ({
        items: [],
        addresses: [],
        recipes: [],
        metadata: prev.metadata,
        ...initialData
      }));
    }
  }, [initialData]);

  // ===================
  // ITEMS MANAGEMENT
  // ===================
  
  const addItem = (itemName) => {
    const trimmed = itemName.trim();
    if (!trimmed) return { success: false, error: 'Item name cannot be empty' };
    if (data.items.includes(trimmed)) return { success: false, error: 'Item already exists' };
    
    setData(prev => ({
      ...prev,
      items: [...prev.items, trimmed]
    }));
    
    return { success: true };
  };

  const removeItem = (itemName) => {
    // Check if item is used in any recipes
    const usedInRecipes = data.recipes.some(recipe => 
      recipe.input.some(input => input.item === itemName) ||
      recipe.output.item === itemName
    );

    if (usedInRecipes) {
      return { success: false, error: 'Cannot delete item - it\'s used in recipes' };
    }

    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item !== itemName)
    }));

    return { success: true };
  };

  const updateItem = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return { success: false, error: 'Item name cannot be empty' };
    if (data.items.includes(trimmed) && trimmed !== oldName) {
      return { success: false, error: 'Item name already exists' };
    }

    // Update in items list
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item === oldName ? trimmed : item),
      // Update in all recipes that use this item
      recipes: prev.recipes.map(recipe => ({
        ...recipe,
        input: recipe.input.map(input => 
          input.item === oldName ? { ...input, item: trimmed } : input
        ),
        output: recipe.output.item === oldName 
          ? { ...recipe.output, item: trimmed }
          : recipe.output
      }))
    }));

    return { success: true };
  };

  // ===================
  // ADDRESSES MANAGEMENT
  // ===================

  const addAddress = (address) => {
    const trimmed = address.trim();
    if (!trimmed) return { success: false, error: 'Address cannot be empty' };
    if (data.addresses.includes(trimmed)) return { success: false, error: 'Address already exists' };
    
    setData(prev => ({
      ...prev,
      addresses: [...prev.addresses, trimmed]
    }));
    
    return { success: true };
  };

  const removeAddress = (address) => {
    // Check if address is used in any recipes
    const usedInRecipes = data.recipes.some(recipe => recipe.address === address);

    if (usedInRecipes) {
      return { success: false, error: 'Cannot delete address - it\'s used in recipes' };
    }

    setData(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr !== address)
    }));

    return { success: true };
  };

  const updateAddress = (oldAddress, newAddress) => {
    const trimmed = newAddress.trim();
    if (!trimmed) return { success: false, error: 'Address cannot be empty' };
    if (data.addresses.includes(trimmed) && trimmed !== oldAddress) {
      return { success: false, error: 'Address already exists' };
    }

    setData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr => addr === oldAddress ? trimmed : addr),
      // Update in all recipes that use this address
      recipes: prev.recipes.map(recipe => 
        recipe.address === oldAddress 
          ? { ...recipe, address: trimmed }
          : recipe
      )
    }));

    return { success: true };
  };

  // ===================
  // RECIPES MANAGEMENT
  // ===================

  const validateRecipe = (recipe) => {
    if (!recipe.name || !recipe.name.trim()) {
      return { valid: false, error: 'Recipe name is required' };
    }

    if (!recipe.address || !data.addresses.includes(recipe.address)) {
      return { valid: false, error: 'Valid address is required' };
    }

    if (!recipe.output || !recipe.output.item || !data.items.includes(recipe.output.item)) {
      return { valid: false, error: 'Valid output item is required' };
    }

    if (!recipe.output.amount || recipe.output.amount <= 0) {
      return { valid: false, error: 'Output amount must be greater than 0' };
    }

    if (!recipe.input || !Array.isArray(recipe.input) || recipe.input.length === 0) {
      return { valid: false, error: 'At least one input item is required' };
    }

    for (const input of recipe.input) {
      if (!input.item || !data.items.includes(input.item)) {
        return { valid: false, error: `Invalid input item: ${input.item}` };
      }
      if (!input.amount || input.amount <= 0) {
        return { valid: false, error: 'All input amounts must be greater than 0' };
      }
    }

    if (!recipe.cycles || recipe.cycles <= 0) {
      return { valid: false, error: 'Cycles must be greater than 0' };
    }

    return { valid: true };
  };

  const addRecipe = (recipe) => {
    if (validateRecipes) {
      const validation = validateRecipe(recipe);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }

    // Check for duplicate recipe names
    if (data.recipes.some(r => r.name === recipe.name.trim())) {
      return { success: false, error: 'Recipe name already exists' };
    }

    const newRecipe = {
      ...recipe,
      id: autoGenerateIds ? `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : recipe.id,
      name: recipe.name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      recipes: [...prev.recipes, newRecipe]
    }));

    return { success: true, recipe: newRecipe };
  };

  const updateRecipe = (recipeId, updates) => {
    const updatedRecipe = { ...updates, updatedAt: new Date().toISOString() };

    if (validateRecipes) {
      const currentRecipe = data.recipes.find(r => r.id === recipeId);
      if (!currentRecipe) {
        return { success: false, error: 'Recipe not found' };
      }

      const validation = validateRecipe({ ...currentRecipe, ...updatedRecipe });
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }

    setData(prev => ({
      ...prev,
      recipes: prev.recipes.map(recipe => 
        recipe.id === recipeId ? { ...recipe, ...updatedRecipe } : recipe
      )
    }));

    return { success: true };
  };

  const removeRecipe = (recipeId) => {
    setData(prev => ({
      ...prev,
      recipes: prev.recipes.filter(recipe => recipe.id !== recipeId)
    }));

    return { success: true };
  };

  const duplicateRecipe = (recipeId) => {
    const originalRecipe = data.recipes.find(r => r.id === recipeId);
    if (!originalRecipe) {
      return { success: false, error: 'Recipe not found' };
    }

    const duplicatedRecipe = {
      ...originalRecipe,
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalRecipe.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      recipes: [...prev.recipes, duplicatedRecipe]
    }));

    return { success: true, recipe: duplicatedRecipe };
  };

  // ===================
  // UTILITY FUNCTIONS
  // ===================

  const getRecipesByAddress = (address) => {
    return data.recipes.filter(recipe => recipe.address === address);
  };

  const getRecipesByItem = (itemName) => {
    return data.recipes.filter(recipe => 
      recipe.output.item === itemName ||
      recipe.input.some(input => input.item === itemName)
    );
  };

  const getItemUsage = (itemName) => {
    const usage = {
      producedBy: [],
      consumedBy: [],
      totalProduced: 0,
      totalConsumed: 0
    };

    data.recipes.forEach(recipe => {
      if (recipe.output.item === itemName) {
        usage.producedBy.push({
          recipe: recipe.name,
          amount: recipe.output.amount,
          cycles: recipe.cycles,
          totalPerCycle: recipe.output.amount * recipe.cycles
        });
        usage.totalProduced += recipe.output.amount * recipe.cycles;
      }

      recipe.input.forEach(input => {
        if (input.item === itemName) {
          usage.consumedBy.push({
            recipe: recipe.name,
            amount: input.amount,
            cycles: recipe.cycles,
            totalPerCycle: input.amount * recipe.cycles
          });
          usage.totalConsumed += input.amount * recipe.cycles;
        }
      });
    });

    return usage;
  };

  const getStats = () => {
    return {
      totalItems: data.items.length,
      totalAddresses: data.addresses.length,
      totalRecipes: data.recipes.length,
      mostUsedItems: data.items.map(item => ({
        item,
        usage: getItemUsage(item),
        usageCount: getRecipesByItem(item).length
      })).sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
      addressUsage: data.addresses.map(address => ({
        address,
        recipeCount: getRecipesByAddress(address).length
      })).sort((a, b) => b.recipeCount - a.recipeCount)
    };
  };

  const clearAllData = () => {
    setData({
      items: [],
      addresses: [],
      recipes: [],
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
        lastModified: new Date().toISOString()
      }
    });
  };

  const exportData = () => {
    return JSON.parse(JSON.stringify(data)); // Deep clone
  };

  const importData = (newData) => {
    try {
      const importedData = {
        items: Array.isArray(newData.items) ? newData.items : [],
        addresses: Array.isArray(newData.addresses) ? newData.addresses : [],
        recipes: Array.isArray(newData.recipes) ? newData.recipes : [],
        metadata: {
          ...data.metadata,
          ...newData.metadata,
          lastModified: new Date().toISOString()
        }
      };

      setData(importedData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    // Data
    data,
    items: data.items,
    addresses: data.addresses,
    recipes: data.recipes,
    metadata: data.metadata,

    // Items management
    addItem,
    removeItem,
    updateItem,

    // Addresses management
    addAddress,
    removeAddress,
    updateAddress,

    // Recipes management
    addRecipe,
    updateRecipe,
    removeRecipe,
    duplicateRecipe,
    validateRecipe,

    // Utility functions
    getRecipesByAddress,
    getRecipesByItem,
    getItemUsage,
    getStats,

    // Data management
    clearAllData,
    exportData,
    importData
  };
};

export default useRecipeManager;