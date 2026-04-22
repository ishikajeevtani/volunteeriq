import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import NGOPortal from './pages/NGOPortal'
import VolunteerPortal from './pages/VolunteerPortal'
import NSSPortal from './pages/NSSPortal'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ngo" element={<NGOPortal />} />
            <Route path="/volunteer" element={<VolunteerPortal />} />
            <Route path="/nss" element={<NSSPortal />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App