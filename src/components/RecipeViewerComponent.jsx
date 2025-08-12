import React, { useState } from 'react';
import { RecipeCard } from '@components';
import { ChefHat } from 'lucide-react';

// Main Recipe Viewer Component
const RecipeViewerComponent = ({ recipeManager, className = "" }) => {
  const [sortBy, setSortBy] = useState('name'); // 'name', 'address', 'created'
  const [filterBy, setFilterBy] = useState(''); // filter by address

  const handleUpdateRecipe = (recipeId, updatedData) => {
    const result = recipeManager.updateRecipe(recipeId, updatedData);
    if (!result.success) {
      alert(`Failed to update recipe: ${result.error}`);
    }
  };

  const handleDeleteRecipe = (recipeId) => {
    recipeManager.removeRecipe(recipeId);
  };

  const handleDuplicateRecipe = (recipeId) => {
    const result = recipeManager.duplicateRecipe(recipeId);
    if (!result.success) {
      alert(`Failed to duplicate recipe: ${result.error}`);
    }
  };

  // Sort and filter recipes
  const sortedAndFilteredRecipes = React.useMemo(() => {
    let filtered = recipeManager.recipes;

    // Filter by address
    if (filterBy) {
      filtered = filtered.filter(recipe => recipe.address === filterBy);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'address':
          return a.address.localeCompare(b.address);
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [recipeManager.recipes, sortBy, filterBy]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChefHat size={24} className="text-purple-600" />
          <h3 className="text-lg font-semibold">
            Recipes ({sortedAndFilteredRecipes.length})
          </h3>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Addresses</option>
            {recipeManager.addresses.map(address => (
              <option key={address} value={address}>{address}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="address">Sort by Address</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Recipe List */}
      {sortedAndFilteredRecipes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ChefHat size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {filterBy ? `No recipes found for "${filterBy}"` : 'No recipes created yet'}
          </p>
          <p className="text-sm">
            {filterBy ? 'Try changing the filter' : 'Create your first recipe to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedAndFilteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              availableItems={recipeManager.items}
              availableAddresses={recipeManager.addresses}
              onUpdate={handleUpdateRecipe}
              onDelete={handleDeleteRecipe}
              onDuplicate={handleDuplicateRecipe}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {sortedAndFilteredRecipes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {sortedAndFilteredRecipes.length}
              </div>
              <div className="text-sm text-blue-800">
                {filterBy ? 'Filtered' : 'Total'} Recipes
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {new Set(sortedAndFilteredRecipes.map(r => r.address)).size}
              </div>
              <div className="text-sm text-green-800">Addresses Used</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {new Set(sortedAndFilteredRecipes.map(r => r.output.item)).size}
              </div>
              <div className="text-sm text-purple-800">Unique Outputs</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">
                {sortedAndFilteredRecipes.filter(r => !r.input || r.input.length === 0).length}
              </div>
              <div className="text-sm text-orange-800">Generated Items</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeViewerComponent;