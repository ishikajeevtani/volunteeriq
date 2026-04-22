import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Portal.css'

function NSSPortal() {
  const [activeTab, setActiveTab] = useState('register')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [drives, setDrives] = useState([])

  const [officerForm, setOfficerForm] = useState({
    name: '', email: '', phone: '',
    college: '', unit_number: '', district: ''
  })

  const [driveForm, setDriveForm] = useState({
    title: '', description: '', category: '',
    location: '', volunteers_needed: '', date: '',
    ngo_name: ''
  })

  const categories = ['Blood Donation', 'Food Drive', 'Tree Plantation',
    'Cleanliness Drive', 'Disaster Relief', 'Education',
    'Healthcare Camp', 'Village Survey', 'Other']

  useEffect(() => {
    if (activeTab === 'drives') fetchDrives()
  }, [activeTab])

  const fetchDrives = async () => {
    const { data } = await supabase
      .from('needs')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setDrives(data)
  }

  const handleOfficerChange = (e) => {
    setOfficerForm({ ...officerForm, [e.target.name]: e.target.value })
  }

  const handleDriveChange = (e) => {
    setDriveForm({ ...driveForm, [e.target.name]: e.target.value })
  }

  const calculateUrgency = (volunteersNeeded, date) => {
    const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 2) return 10
    if (daysLeft <= 5) return 8
    if (daysLeft <= 7) return 6
    if (volunteersNeeded >= 20) return 7
    return 4
  }

  const handleOfficerSubmit = async () => {
    if (!officerForm.name || !officerForm.email || !officerForm.college || !officerForm.unit_number) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('nss_officers').insert([officerForm])
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setOfficerForm({ name: '', email: '', phone: '', college: '', unit_number: '', district: '' })
    } else alert('Error submitting. Try again.')
  }

  const handleDriveSubmit = async () => {
    if (!driveForm.title || !driveForm.location || !driveForm.volunteers_needed || !driveForm.date || !driveForm.ngo_name) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    const urgency_score = calculateUrgency(driveForm.volunteers_needed, driveForm.date)
    const { error } = await supabase.from('needs').insert([{
      ...driveForm,
      volunteers_needed: parseInt(driveForm.volunteers_needed),
      urgency_score,
      ngo_name: `NSS - ${driveForm.ngo_name}`
    }])
    setLoading(false)
    if (!error) {
      setSuccess(true)
      setDriveForm({ title: '', description: '', category: '', location: '', volunteers_needed: '', date: '', ngo_name: '' })
      fetchDrives()
    } else alert('Error submitting. Try again.')
  }

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h2>🎓 NSS Officer Portal</h2>
        <p>Register your unit and coordinate NSS drives efficiently</p>
      </div>

      {success && (
        <div className="success-banner">
          ✅ Submitted successfully! VolunteerIQ AI will coordinate volunteers.
        </div>
      )}

      <div className="portal-tabs">
        <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => { setActiveTab('register'); setSuccess(false) }}>
          📝 Register Unit
        </button>
        <button className={`tab-btn ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => { setActiveTab('post'); setSuccess(false) }}>
          🚀 Post Drive
        </button>
        <button className={`tab-btn ${activeTab === 'drives' ? 'active' : ''}`}
          onClick={() => { setActiveTab('drives'); setSuccess(false) }}>
          📋 All Drives
        </button>
      </div>

      {activeTab === 'register' && (
        <div className="portal-card">
          <div className="form-row">
            <div className="form-group">
              <label>Officer Name *</label>
              <input name="name" value={officerForm.name}
                onChange={handleOfficerChange} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={officerForm.email}
                onChange={handleOfficerChange} placeholder="officer@college.edu" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>College/University *</label>
              <input name="college" value={officerForm.college}
                onChange={handleOfficerChange} placeholder="e.g. RJIT, Gwalior" />
            </div>
            <div className="form-group">
              <label>NSS Unit Number *</label>
              <input name="unit_number" value={officerForm.unit_number}
                onChange={handleOfficerChange} placeholder="e.g. MP/GWL/001" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>District *</label>
              <input name="district" value={officerForm.district}
                onChange={handleOfficerChange} placeholder="e.g. Gwalior" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={officerForm.phone}
                onChange={handleOfficerChange} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <button className="btn-submit" onClick={handleOfficerSubmit} disabled={loading}>
            {loading ? '⏳ Registering...' : '✅ Register NSS Unit'}
          </button>
        </div>
      )}

      {activeTab === 'post' && (
        <div className="portal-card">
          <div className="form-group">
            <label>Unit / College Name *</label>
            <input name="ngo_name" value={driveForm.ngo_name}
              onChange={handleDriveChange} placeholder="e.g. RJIT NSS Unit" />
          </div>
          <div className="form-group">
            <label>Drive Title *</label>
            <input name="title" value={driveForm.title}
              onChange={handleDriveChange} placeholder="e.g. Blood Donation Camp 2026" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={driveForm.description}
              onChange={handleDriveChange}
              placeholder="What will volunteers be doing? Any special requirements?" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={driveForm.category} onChange={handleDriveChange}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input name="location" value={driveForm.location}
                onChange={handleDriveChange} placeholder="e.g. Gwalior, MP" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Volunteers Needed *</label>
              <input type="number" name="volunteers_needed"
                value={driveForm.volunteers_needed}
                onChange={handleDriveChange} placeholder="e.g. 20" />
            </div>
            <div className="form-group">
              <label>Drive Date *</label>
              <input type="date" name="date" value={driveForm.date}
                onChange={handleDriveChange} />
            </div>
          </div>
          <button className="btn-submit" onClick={handleDriveSubmit} disabled={loading}>
            {loading ? '⏳ Posting...' : '🚀 Post NSS Drive'}
          </button>
        </div>
      )}

      {activeTab === 'drives' && (
        <div className="drives-list">
          {drives.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <p>No drives posted yet.</p>
            </div>
          ) : (
            drives.map(drive => (
              <div key={drive.id} className="drive-row">
                <div className="drive-row-info">
                  <span className="drive-row-title">{drive.title}</span>
                  <span className="drive-row-meta">
                    🏢 {drive.ngo_name} · 📍 {drive.location} · 📅 {drive.date}
                  </span>
                </div>
                <div className="drive-row-right">
                  <span className="drive-volunteers">
                    👥 {drive.volunteers_confirmed}/{drive.volunteers_needed}
                  </span>
                  <span className={`badge ${drive.urgency_score >= 8 ? 'badge-urgent' : drive.urgency_score >= 6 ? 'badge-high' : 'badge-medium'}`}>
                    {drive.urgency_score}/10
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NSSPortal