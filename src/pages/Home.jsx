import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>🤝 VolunteerIQ</h1>
        <p className="tagline">AI-Powered Volunteer Coordination for Social Impact</p>
        <p className="subtitle">
          Connecting the right volunteers to the right causes — 
          at the right time, in the right place.
        </p>
        <div className="hero-buttons">
          <Link to="/ngo" className="btn btn-primary">I'm an NGO</Link>
          <Link to="/volunteer" className="btn btn-secondary">I'm a Volunteer</Link>
          <Link to="/dashboard" className="btn btn-outline">View Dashboard</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <span>📊</span>
          <h3>Smart Urgency Scoring</h3>
          <p>AI analyzes every drive and assigns real-time urgency scores so no critical need goes unnoticed.</p>
        </div>
        <div className="feature-card">
          <span>🎯</span>
          <h3>Precision Matching</h3>
          <p>Gemini AI matches volunteers to drives based on skills, location, and availability.</p>
        </div>
        <div className="feature-card">
          <span>🔮</span>
          <h3>Predictive Alerts</h3>
          <p>Get alerted before a shortage happens — not after. Proactive coordination saves lives.</p>
        </div>
        <div className="feature-card">
          <span>🗺️</span>
          <h3>Live Need Map</h3>
          <p>See all active drives across your city on a live dashboard — updated in real time.</p>
        </div>
      </div>
    </div>
  )
}

export default Home
