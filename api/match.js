module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { need, volunteers } = req.body;
  if (!need || !volunteers || volunteers.length === 0) return res.status(400).json({ error: "Missing data" });
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: `Match volunteers to this drive: ${JSON.stringify(need)}. Volunteers: ${JSON.stringify(volunteers)}. Return ONLY a JSON array with volunteer_id, name, match_score, reason fields. Only scores above 40.` }], temperature: 0.3, max_tokens: 1000 }) });
    const data = await response.json();
    const text = data.choices[0].message.content.trim().replace(/```json|```/g, "").trim();
    return res.status(200).json({ matches: JSON.parse(text) });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
