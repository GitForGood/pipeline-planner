import { useRecipeManager } from '@hooks'
import { createItemsManager, createAddressesManager } from '@facades'
import { ListViewComponent, DataImportExport, RecipeCreationComponent, DataSummaryComponent, RecipeViewerComponent } from '@components'

function ToolPage () {
  const recipeManager = useRecipeManager();
  return (
    <>
      <header>
        
      </header>
      <main className="container mx-auto px-4">
        <DataImportExport 
          recipeManager={recipeManager} 
          className="mb-4" 
        />
        <RecipeCreationComponent 
            recipeManager={recipeManager}
          />
        <RecipeViewerComponent 
          recipeManager={recipeManager}
          className="mt-4"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <ListViewComponent
            data={createItemsManager(recipeManager)} 
            title="Items"
          />
          <ListViewComponent 
            data={createAddressesManager(recipeManager)} 
            title="Addresses"
          />
        </div>
        <DataSummaryComponent 
          recipeManager={recipeManager}
          className="mt-4"
        />
      </main>
      <footer></footer>
    </>
  )
};

export default ToolPage;