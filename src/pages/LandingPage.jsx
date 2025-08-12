/* Landing.jsx */

import { ArrowRight } from 'lucide-react'

function LandingPage() {
  return (
    <>
      <main className='clipboard'>
        <div aria-hidden className='h-16 w-1/2 max-w-screen-sm top-10 z-10 absolute flex flex-col place-items-center'>
          <div className='bg-gray-400 w-1/4 h-8 rounded-t-md border-t-8 border-gray-500'></div>
          <div className='bg-gray-400 w-2/3 h-8 rounded-t-xl border-b-8 border-gray-300 rounded-b-sm'></div>
        </div>
        <div className='paper pt-10 mt-10 z-0'>
          <section className='p-4 text-xl gap-4 flex flex-col'>
            <h1 className='text-4xl'>Pipeline Planner</h1>
            <p>A tool to help you plan out your production lines to prevent bottlenecks in the create mod.</p>
            <div className='grid gap-4 md:grid-cols-3 sm:grid-cols-1'>
              <p className='my-auto'>Check it out now!</p>
              <a href="/tool" className='btn-secondary md:col-start-[3] flex-grow flex justify-center'> 
                  Proceed to Tool
                  <ArrowRight/>
              </a>
            </div>
          </section>
          <section className='m-4 p-8 flex flex-col gap-8 printed-border'>
            <h2>The Problem</h2>
            <p>The factory guages the mod provides do not allow for a clear overview of the usage of each specific item in the production pipeline. When trying to decide how many of each item you need stockpiled for the factory to work without any bottlenecks, this would be a useful statistic. This being the case as the demand on a resource might exceed the amount stored if not configured correctly.</p>
            <p>The naïve solution is to simply store each item in a seperate vaults and combining orders with re-packagers, but as this <a href="https://github.com/Creators-of-Create/Create/issues/7663">bug report on the official mod github page</a> suggests, this does not currently work as intended. As such, this tool served to enable us to have an item buffer in the factory that can combine the resources, given that we know the expected load of resources by the manufacturing process.</p>
            <p>Similarily to the difficulty overviewing resource need, there is no method provided for analyzing the traffic load at different adresses. This may make it difficult to spot which ones are being used the most and need the increased throughput.</p>
          </section>

          <section className='m-4 p-8 flex flex-col gap-8 printed-border'>
            <h2>My Proposed Solution</h2>
            <p>A structured list of items, processes, and the connection between them.</p>
            <p></p>
          </section>
          <section className="grid md:grid-cols-3 sm:grid-cols-2 gap-4 p-4">
            <div className="sticky-note bg-cyan-200">
              <address className="grid grid-rows-2 gap-8">
                <p>
                  Creator of this mess: Oliver Andersson 2025
                </p>
                <p>
                  Contact if something breaks! <a href="mailto:oliversofta@gmail.com" className="underline">oliversofta@gmail.com</a>
                </p>
              </address>
            </div>
            <div className="sticky-note bg-lime-300 grid grid-rows-2 gap-8">
                <a href="https://github.com/GitForGood/pipeline-planner" className="text-2xl underline">Found the Project ! </a>
                <p>(click above to check out the github repo)</p>
            </div>
            <div className="sticky-note bg-purple-300">
              <p>
                In case you still have missed it <a href="/tool" className="underline">the tool can still be found here</a>.
              </p> 
            </div>
          </section>
        </div>
      </main>
    </>
  )
};

export default LandingPage;