import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Portal.css'

function NGOPortal() {
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    location: '', volunteers_needed: '', date: '', ngo_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const categories = ['Food Drive', 'Blood Donation', 'Disaster Relief', 
    'Education', 'Healthcare', 'Environment', 'Elder Care', 'Other']

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const calculateUrgency = (volunteersNeeded, date) => {
    const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 2) return 10
    if (daysLeft <= 5) return 8
    if (daysLeft <= 7) return 6
    if (volunteersNeeded >= 20) return 7
    return 4
  }

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.volunteers_needed || !form.date || !form.ngo_name) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    const urgency_score = calculateUrgency(form.volunteers_needed, form.date)
    const { error } = await supabase.from('needs').insert([{
      ...form,
      volunteers_needed: parseInt(form.volunteers_needed),
      urgency_score
    }])
    setLoading(false)
    if (!error) { setSuccess(true); setForm({ title: '', description: '', category: '', location: '', volunteers_needed: '', date: '', ngo_name: '' }) }
    else alert('Error submitting. Try again.')
  }

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h2>🏢 NGO Portal</h2>
        <p>Post your drive and find the right volunteers instantly</p>
      </div>
      {success && <div className="success-banner">✅ Drive posted successfully! AI will match volunteers shortly.</div>}
      <div className="portal-card">
        <div className="form-group">
          <label>NGO Name *</label>
          <input name="ngo_name" value={form.ngo_name} onChange={handleChange} placeholder="e.g. Red Cross India" />
        </div>
        <div className="form-group">
          <label>Drive Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Winter Food Distribution Drive" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe what volunteers will be doing..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Gwalior, MP" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Volunteers Needed *</label>
            <input type="number" name="volunteers_needed" value={form.volunteers_needed} onChange={handleChange} placeholder="e.g. 15" />
          </div>
          <div className="form-group">
            <label>Drive Date *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </div>
        </div>
        <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Posting...' : '🚀 Post Drive'}
        </button>
      </div>
    </div>
  )
}

export default NGOPortal