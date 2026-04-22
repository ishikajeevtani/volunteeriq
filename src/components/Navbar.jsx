import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🤝 VolunteerIQ</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/ngo">NGO Portal</Link>
        <Link to="/volunteer">Volunteer Portal</Link>
        <Link to="/matches">AI Matches</Link>
      </div>
    </nav>
  )
}

export default Navbar