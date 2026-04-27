import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Matches.css'

function Matches() {
  const [needs, setNeeds] = useState([])
  const [selectedNeed, setSelectedNeed] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [aiExplanation, setAiExplanation] = useState('')

  useEffect(() => { fetchNeeds() }, [])

  const fetchNeeds = async () => {
    setFetching(true)
    const { data } = await supabase.from('needs').select('*').eq('status', 'active').order('urgency_score', { ascending: false })
    if (data) setNeeds(data)
    setFetching(false)
  }

  const findMatches = async (need) => {
    setSelectedNeed(need)
    setMatches([])
    setAiExplanation('')
    setLoading(true)

    const [volRes, nssRes] = await Promise.all([
      supabase.from('volunteers').select('*'),
      supabase.from('nss_volunteers').select('*')
    ])

    const allVolunteers = [
      ...(volRes.data || []).map(v => ({ ...v, type: 'General' })),
      ...(nssRes.data || []).map(v => ({ ...v, type: 'NSS' }))
    ]

    if (allVolunteers.length === 0) {
      setAiExplanation('No volunteers registered yet!')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need, volunteers: allVolunteers })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'API error')

      setMatches(data.matches || [])
      setAiExplanation(`AI analyzed ${allVolunteers.length} volunteers for "${need.title}" based on skills, location & availability.`)
    } catch (err) {
      console.error(err)
      setAiExplanation(`API Error: ${err.message}`)
    }

    setLoading(false)
  }

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981'
    if (score >= 65) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <h2>🤖 AI Volunteer Matching</h2>
        <p>Powered by Groq AI — Select a drive to find the best volunteers</p>
      </div>
      <div className="matches-layout">
        <div className="needs-list">
          <h3>Active Drives</h3>
          {fetching ? <div className="mini-loading">Loading...</div> :
            needs.length === 0 ? <div className="mini-empty">No active drives.</div> :
            needs.map(need => (
              <div key={need.id} className={`need-item ${selectedNeed?.id === need.id ? 'active' : ''}`} onClick={() => findMatches(need)}>
                <div className="need-item-top">
                  <span className="need-item-title">{need.title}</span>
                  <span className={`urgency-dot ${need.urgency_score >= 8 ? 'critical' : need.urgency_score >= 6 ? 'high' : 'medium'}`}></span>
                </div>
                <span className="need-item-meta">📍 {need.location} · {need.category}</span>
                <span className="need-item-meta">👥 {need.volunteers_needed} needed</span>
              </div>
            ))
          }
        </div>
        <div className="match-results">
          {!selectedNeed && !loading && <div className="select-prompt"><span>🎯</span><p>Select a drive from the left to run AI matching</p></div>}
          {loading && <div className="ai-loading"><div className="ai-spinner"></div><p>Groq AI is analyzing volunteers...</p><span>Finding best matches based on skills, location & availability</span></div>}
          {!loading && selectedNeed && (
            <>
              <div className="selected-drive-info">
                <h3>{selectedNeed.title}</h3>
                <p>📍 {selectedNeed.location} · 📅 {selectedNeed.date} · 👥 {selectedNeed.volunteers_needed} needed</p>
              </div>
              {aiExplanation && <div className="ai-summary"><span>🤖 AI Analysis</span><p>{aiExplanation}</p></div>}
              {matches.length > 0 && (
                <div className="match-cards">
                  {matches.map((match, i) => (
                    <div key={i} className="match-card">
                      <div className="match-rank">#{i + 1}</div>
                      <div className="match-info">
                        <div className="match-name-row">
                          <span className="match-name">{match.name}</span>
                          <span className={`match-type ${match.type === 'NSS' ? 'nss' : ''}`}>{match.type === 'NSS' ? '🎓 NSS' : '👤 General'}</span>
                        </div>
                        <p className="match-reason">{match.reason}</p>
                      </div>
                      <div className="match-score" style={{ color: getScoreColor(match.match_score) }}>
                        <span className="score-number">{match.match_score}</span>
                        <span className="score-label">Match %</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Matches