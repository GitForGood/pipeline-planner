import { useRecipeManager } from '@hooks'
import { createItemsManager, createAddressesManager } from '@facades'
import { ListViewComponent, DataImportExport } from '@components'
import { RecipeCreationComponent } from '@components'

function ToolPage () {
  const recipeManager = useRecipeManager();
  return (
    <>
      <header>
        <DataImportExport 
          recipeManager={recipeManager} 
          className="mb-8" 
        />
      </header>
      <main className="container mx-auto px-4">
        <RecipeCreationComponent 
            recipeManager={recipeManager}
          />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ListViewComponent
            data={createItemsManager(recipeManager)} 
            title="Items"
          />
          <ListViewComponent 
            data={createAddressesManager(recipeManager)} 
            title="Addresses"
          />
          
        </div>
      </main>
      <footer></footer>
    </>
  )
};

export default ToolPage;