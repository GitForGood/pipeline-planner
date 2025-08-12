const createItemsManager = (recipeManager) => ({
  items: recipeManager.items,
  add: recipeManager.addItem,
  remove: recipeManager.removeItem,
  getUsage: recipeManager.getRecipesByItem,
  count: recipeManager.items.length
});

export default createItemsManager;