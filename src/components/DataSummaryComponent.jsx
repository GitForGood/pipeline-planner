import { useMemo } from 'react';
import { BarChart3, Package, MapPin, Calculator } from 'lucide-react';

const DataSummaryComponent = ({ recipeManager, className = "" }) => {
  // Recursive calculation engine
  const calculateResourceRequirements = useMemo(() => {
    const { recipes } = recipeManager.data;
    
    // Build a recipe lookup map by output item
    const recipeMap = new Map();
    recipes.forEach(recipe => {
      recipeMap.set(recipe.output.item, recipe);
    });

    // Memoization cache to avoid infinite loops and improve performance
    const cache = new Map();
    
    // Recursive function to calculate total requirements
    const calculateRequirements = (itemName, requiredAmount = 1, visited = new Set()) => {
      // Prevent infinite loops (circular dependencies)
      if (visited.has(itemName)) {
        return { items: new Map(), cycles: new Map() };
      }
      
      // Check cache
      const cacheKey = `${itemName}_${requiredAmount}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      visited.add(itemName);
      
      const result = {
        items: new Map(),
        cycles: new Map()
      };

      // Find recipe that produces this item
      const recipe = recipeMap.get(itemName);
      
      if (!recipe) {
        // No recipe found - this is a base resource
        result.items.set(itemName, requiredAmount);
        visited.delete(itemName);
        cache.set(cacheKey, result);
        return result;
      }

      // Calculate how many recipe cycles we need to run
      const cyclesNeeded = Math.ceil(requiredAmount / recipe.output.amount);
      const actualOutput = cyclesNeeded * recipe.output.amount;
      
      // Add the cycles for this recipe's address
      const currentCycles = result.cycles.get(recipe.address) || 0;
      result.cycles.set(recipe.address, currentCycles + (cyclesNeeded * recipe.cycles));

      // Add the output item (might overproduce)
      result.items.set(itemName, actualOutput);

      // Recursively calculate requirements for input items
      if (recipe.input && recipe.input.length > 0) {
        recipe.input.forEach(input => {
          const inputRequired = input.amount * cyclesNeeded;
          const inputRequirements = calculateRequirements(input.item, inputRequired, new Set(visited));
          
          // Merge input requirements
          inputRequirements.items.forEach((amount, item) => {
            const currentAmount = result.items.get(item) || 0;
            result.items.set(item, currentAmount + amount);
          });
          
          inputRequirements.cycles.forEach((cycles, address) => {
            const currentCycles = result.cycles.get(address) || 0;
            result.cycles.set(address, currentCycles + cycles);
          });
        });
      }

      visited.delete(itemName);
      cache.set(cacheKey, result);
      return result;
    };

    return calculateRequirements;
  }, [recipeManager.data.recipes]);

  // Calculate grand totals across all production lines
  const grandTotals = useMemo(() => {
    const { recipes } = recipeManager.data;
    
    const totalItemRequirements = new Map();
    const totalCycleRequirements = new Map();

    // Find all items that are outputs of recipes (final products)
    const outputItems = recipes.map(recipe => recipe.output.item);
    const uniqueOutputItems = [...new Set(outputItems)];

    // Calculate requirements for 1 unit of each unique output item
    uniqueOutputItems.forEach(item => {
      const requirements = calculateResourceRequirements(item, 1);
      
      // Add to grand totals for items
      requirements.items.forEach((amount, itemName) => {
        const currentTotal = totalItemRequirements.get(itemName) || 0;
        totalItemRequirements.set(itemName, currentTotal + amount);
      });
      
      // Add to grand totals for cycles
      requirements.cycles.forEach((cycles, address) => {
        const currentTotal = totalCycleRequirements.get(address) || 0;
        totalCycleRequirements.set(address, currentTotal + cycles);
      });
    });

    return {
      items: totalItemRequirements,
      cycles: totalCycleRequirements
    };
  }, [recipeManager.data, calculateResourceRequirements]);

  // Sort items and addresses by total usage (highest first)
  const sortedItems = useMemo(() => {
    return Array.from(grandTotals.items.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by amount (descending)
  }, [grandTotals.items]);

  const sortedAddresses = useMemo(() => {
    return Array.from(grandTotals.cycles.entries())
      .sort((a, b) => b[1] - a[1]); // Sort by cycles (descending)
  }, [grandTotals.cycles]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-indigo-600" />
        <h3 className="text-lg font-semibold">Resource Requirements Analysis</h3>
      </div>

      {sortedItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calculator size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No recipes available for analysis</p>
          <p className="text-sm">Create some recipes to see resource calculations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Item Requirements Table */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
              <Package size={16} />
              Total Item Requirements
              <span className="text-sm text-gray-500 font-normal">
                (across all production lines)
              </span>
            </h4>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">
                      Item
                    </th>
                    <th className="px-4 py-3 text-right font-semibold border-b border-gray-300">
                      Total Required
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map(([item, amount], index) => (
                    <tr 
                      key={item} 
                      className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                    >
                      <td className="px-4 py-3 font-medium border-b border-gray-200">
                        {item}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-lg border-b border-gray-200">
                        {amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedItems.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {sortedItems.length} items, sorted by usage (highest first)
              </p>
            )}
          </div>

          {/* Cycle Requirements Table */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
              <MapPin size={16} />
              Total Cycle Requirements
              <span className="text-sm text-gray-500 font-normal">
                (across all production lines)
              </span>
            </h4>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">
                      Address
                    </th>
                    <th className="px-4 py-3 text-right font-semibold border-b border-gray-300">
                      Total Cycles
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAddresses.length > 0 ? (
                    sortedAddresses.map(([address, cycles], index) => (
                      <tr 
                        key={address} 
                        className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                      >
                        <td className="px-4 py-3 font-medium border-b border-gray-200">
                          {address}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-lg border-b border-gray-200">
                          {cycles.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                        No cycle data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {sortedAddresses.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {sortedAddresses.length} addresses, sorted by usage (highest first)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {sortedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{sortedItems.length}</div>
            <div className="text-sm text-blue-800">Items in Analysis</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{sortedAddresses.length}</div>
            <div className="text-sm text-green-800">Active Addresses</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{recipeManager.data.recipes.length}</div>
            <div className="text-sm text-purple-800">Total Recipes</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {sortedItems.reduce((sum, [_, amount]) => sum + amount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-orange-800">Total Resource Flow</div>
          </div>
        </div>
      )}

      {/* Example Explanation */}
      {sortedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h5 className="font-medium text-blue-800 mb-2">How to Read This Analysis:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Total Item Requirements:</strong> Grand total of all resources needed across all production lines</li>
            <li>• <strong>Total Cycle Requirements:</strong> Grand total of processing cycles needed at each address</li>
            <li>• <strong>Sorted by Usage:</strong> Most critical resources and bottleneck addresses appear first</li>
            <li>• <strong>Includes All Chains:</strong> Accounts for recursive production (nuggets → bars → blocks)</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataSummaryComponent;