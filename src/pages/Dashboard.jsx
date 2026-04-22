import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

function Dashboard() {
  const [needs, setNeeds] = useState([])
  const [stats, setStats] = useState({ total: 0, urgent: 0, volunteers: 0, nssVolunteers: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const categories = ['all', 'Food Drive', 'Blood Donation', 'Disaster Relief',
    'Education', 'Healthcare', 'Environment', 'Elder Care', 'Other']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [needsRes, volRes, nssRes] = await Promise.all([
      supabase.from('needs').select('*').eq('status', 'active').order('urgency_score', { ascending: false }),
      supabase.from('volunteers').select('id'),
      supabase.from('nss_volunteers').select('id')
    ])
    if (needsRes.data) {
      setNeeds(needsRes.data)
      const urgent = needsRes.data.filter(n => n.urgency_score >= 8).length
      setStats({
        total: needsRes.data.length,
        urgent,
        volunteers: volRes.data?.length || 0,
        nssVolunteers: nssRes.data?.length || 0
      })
    }
    setLoading(false)
  }

  const getUrgencyBadge = (score) => {
    if (score >= 8) return { label: '🔴 Critical', class: 'badge-urgent' }
    if (score >= 6) return { label: '🟠 High', class: 'badge-high' }
    if (score >= 4) return { label: '🟡 Medium', class: 'badge-medium' }
    return { label: '🟢 Low', class: 'badge-low' }
  }

  const getUrgencyBar = (score) => {
    const percent = (score / 10) * 100
    let color = '#10b981'
    if (score >= 8) color = '#ef4444'
    else if (score >= 6) color = '#f59e0b'
    else if (score >= 4) color = '#6366f1'
    return { percent, color }
  }

  const filteredNeeds = filter === 'all' ? needs : needs.filter(n => n.category === filter)

  const getDaysLeft = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Passed'
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow!'
    return `${days} days left`
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Live Dashboard</h2>
        <p>Real-time view of all active drives and community needs</p>
        <button className="refresh-btn" onClick={fetchData}>🔄 Refresh</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Active Drives</span>
          </div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <span className="stat-number">{stats.urgent}</span>
            <span className="stat-label">Critical Needs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🙋</div>
          <div className="stat-info">
            <span className="stat-number">{stats.volunteers}</span>
            <span className="stat-label">Volunteers</span>
          </div>
        </div>
        <div className="stat-card nss">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <span className="stat-number">{stats.nssVolunteers}</span>
            <span className="stat-label">NSS Volunteers</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}>
            {cat === 'all' ? '🌐 All' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading drives...</p>
        </div>
      ) : filteredNeeds.length === 0 ? (
        <div className="empty-state">
          <span>📭</span>
          <p>No active drives found. NGOs can post drives from the NGO Portal.</p>
        </div>
      ) : (
        <div className="needs-grid">
          {filteredNeeds.map(need => {
            const badge = getUrgencyBadge(need.urgency_score)
            const bar = getUrgencyBar(need.urgency_score)
            const daysLeft = getDaysLeft(need.date)
            const fillPercent = Math.round((need.volunteers_confirmed / need.volunteers_needed) * 100)
            return (
              <div key={need.id} className={`need-card ${need.urgency_score >= 8 ? 'critical' : ''}`}>
                <div className="need-card-top">
                  <span className={`badge ${badge.class}`}>{badge.label}</span>
                  <span className="days-left">{daysLeft}</span>
                </div>
                <h3>{need.title}</h3>
                <p className="need-ngo">🏢 {need.ngo_name}</p>
                <p className="need-location">📍 {need.location}</p>
                {need.description && <p className="need-desc">{need.description}</p>}
                <div className="need-category">{need.category}</div>

                <div className="urgency-section">
                  <div className="urgency-label">
                    <span>Urgency Score</span>
                    <span style={{ color: bar.color }}>{need.urgency_score}/10</span>
                  </div>
                  <div className="urgency-bar">
                    <div className="urgency-fill"
                      style={{ width: `${bar.percent}%`, background: bar.color }}>
                    </div>
                  </div>
                </div>

                <div className="volunteer-progress">
                  <div className="progress-label">
                    <span>Volunteers</span>
                    <span>{need.volunteers_confirmed}/{need.volunteers_needed}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard