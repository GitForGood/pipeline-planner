import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@pages'
import { ToolPage } from '@pages'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tool" element={<ToolPage />} />
      </Routes>
    </Router>
  )
}

export default App