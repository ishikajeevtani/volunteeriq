export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { need, volunteers } = req.body

  const prompt = `You are VolunteerIQ's AI matching engine.
Drive: ${need.title}, Category: ${need.category}, Location: ${need.location}, Date: ${need.date}, Volunteers Needed: ${need.volunteers_needed}, Urgency: ${need.urgency_score}/10

Volunteers:
${volunteers.map((v, i) => `${i + 1}. ${v.name}, ${v.location}, Skills: ${Array.isArray(v.skills) ? v.skills.join(', ') : 'None'}, ${v.availability}, ${v.type}${v.college ? ', ' + v.college : ''}`).join('\n')}

Select TOP ${Math.min(need.volunteers_needed, volunteers.length)} matches.
Respond ONLY in JSON:
{"matches":[{"name":"name","match_score":95,"reason":"reason","type":"General or NSS"}],"summary":"2-3 line analysis"}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      }
    )
    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message })
    const text = data.candidates[0].content.parts[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}