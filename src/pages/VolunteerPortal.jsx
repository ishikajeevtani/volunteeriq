import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Portal.css'

function VolunteerPortal() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [generalForm, setGeneralForm] = useState({
    name: '', email: '', phone: '', location: '',
    availability: '', skills: ''
  })

  const [nssForm, setNssForm] = useState({
    name: '', email: '', phone: '', college: '',
    unit_number: '', program_officer: '', location: '',
    availability: '', skills: ''
  })

  const skillOptions = ['Driving', 'Medical/First Aid', 'Teaching',
    'Cooking', 'Logistics', 'Communication', 'Photography',
    'Social Media', 'Physical Labor', 'Languages']

  const handleGeneralChange = (e) => {
    setGeneralForm({ ...generalForm, [e.target.name]: e.target.value })
  }

  const handleNSSChange = (e) => {
    setNssForm({ ...nssForm, [e.target.name]: e.target.value })
  }

  const toggleSkill = (form, setForm, skill) => {
    const skills = form.skills ? form.skills.split(',').filter(Boolean) : []
    const updated = skills.includes(skill)
      ? skills.filter(s => s !== skill)
      : [...skills, skill]
    setForm({ ...form, skills: updated.join(',') })
  }

  const handleGeneralSubmit = async () => {
    if (!generalForm.name || !generalForm.email || !generalForm.location || !generalForm.availability) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    const skillsArray = generalForm.skills ? generalForm.skills.split(',').filter(Boolean) : []
    const { error } = await supabase.from('volunteers').insert([{
      ...generalForm, skills: skillsArray
    }])
    setLoading(false)
    if (!error) { setSuccess(true); setGeneralForm({ name: '', email: '', phone: '', location: '', availability: '', skills: '' }) }
    else alert('Error submitting. Try again.')
  }

  const handleNSSSubmit = async () => {
    if (!nssForm.name || !nssForm.email || !nssForm.college || !nssForm.unit_number) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    const skillsArray = nssForm.skills ? nssForm.skills.split(',').filter(Boolean) : []
    const { error } = await supabase.from('nss_volunteers').insert([{
      ...nssForm, skills: skillsArray
    }])
    setLoading(false)
    if (!error) { setSuccess(true); setNssForm({ name: '', email: '', phone: '', college: '', unit_number: '', program_officer: '', location: '', availability: '', skills: '' }) }
    else alert('Error submitting. Try again.')
  }

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h2>🙋 Volunteer Portal</h2>
        <p>Register as a volunteer and get matched to drives that need you</p>
      </div>

      {success && <div className="success-banner">✅ Registered successfully! You'll be matched to relevant drives soon.</div>}

      <div className="portal-tabs">
        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}>
          👤 General Volunteer
        </button>
        <button className={`tab-btn ${activeTab === 'nss' ? 'active' : ''}`}
          onClick={() => setActiveTab('nss')}>
          🎓 NSS Volunteer
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="portal-card">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={generalForm.name} onChange={handleGeneralChange} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={generalForm.email} onChange={handleGeneralChange} placeholder="your@email.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={generalForm.phone} onChange={handleGeneralChange} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input name="location" value={generalForm.location} onChange={handleGeneralChange} placeholder="e.g. Gwalior, MP" />
            </div>
          </div>
          <div className="form-group">
            <label>Availability *</label>
            <select name="availability" value={generalForm.availability} onChange={handleGeneralChange}>
              <option value="">Select availability</option>
              <option value="Weekdays">Weekdays</option>
              <option value="Weekends">Weekends</option>
              <option value="Both">Both Weekdays & Weekends</option>
              <option value="Flexible">Fully Flexible</option>
            </select>
          </div>
          <div className="form-group">
            <label>Skills</label>
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <button key={skill} type="button"
                  className={`skill-tag ${generalForm.skills.includes(skill) ? 'active' : ''}`}
                  onClick={() => toggleSkill(generalForm, setGeneralForm, skill)}>
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-submit" onClick={handleGeneralSubmit} disabled={loading}>
            {loading ? '⏳ Registering...' : '✅ Register as Volunteer'}
          </button>
        </div>
      )}

      {activeTab === 'nss' && (
        <div className="portal-card">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={nssForm.name} onChange={handleNSSChange} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={nssForm.email} onChange={handleNSSChange} placeholder="your@email.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>College/University *</label>
              <input name="college" value={nssForm.college} onChange={handleNSSChange} placeholder="e.g. RJIT, Gwalior" />
            </div>
            <div className="form-group">
              <label>NSS Unit Number *</label>
              <input name="unit_number" value={nssForm.unit_number} onChange={handleNSSChange} placeholder="e.g. MP/GWL/001" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Program Officer Name *</label>
              <input name="program_officer" value={nssForm.program_officer} onChange={handleNSSChange} placeholder="Your NSS PO name" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={nssForm.phone} onChange={handleNSSChange} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input name="location" value={nssForm.location} onChange={handleNSSChange} placeholder="e.g. Gwalior, MP" />
            </div>
            <div className="form-group">
              <label>Availability *</label>
              <select name="availability" value={nssForm.availability} onChange={handleNSSChange}>
                <option value="">Select availability</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Both">Both Weekdays & Weekends</option>
                <option value="Flexible">Fully Flexible</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Skills</label>
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <button key={skill} type="button"
                  className={`skill-tag ${nssForm.skills.includes(skill) ? 'active' : ''}`}
                  onClick={() => toggleSkill(nssForm, setNssForm, skill)}>
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-submit" onClick={handleNSSSubmit} disabled={loading}>
            {loading ? '⏳ Registering...' : '🎓 Register as NSS Volunteer'}
          </button>
        </div>
      )}
    </div>
  )
}

export default VolunteerPortal