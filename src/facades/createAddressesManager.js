const createAddressesManager = (recipeManager) => ({
  items: recipeManager.addresses,
  add: recipeManager.addAddress,
  remove: recipeManager.removeAddress,
  getUsage: recipeManager.getRecipesByAddress,
  count: recipeManager.addresses.length
});

export default createAddressesManager;