/* App.jsx */

import Footer from './components/Footer'
import Header from './components/Header'
import ContactSection from './components/ContactSection'
import './App.css'

function App() {
  return (
    <>
      <Header/>
      <main className='clipboard'>
        <div className='paper'>
          <h1>TESTING</h1>
          <ContactSection/>
        </div>
      </main>
      <Footer/>
    </>
  )
}

export default App;