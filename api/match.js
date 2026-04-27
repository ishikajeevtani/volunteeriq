module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { need, volunteers } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set" });
  const prompt = `You are a volunteer matching assistant. Return top 3 matches as a raw JSON array with match_reason field. No markdown.\n\nNEED:\n${JSON.stringify(need)}\n\nVOLUNTEERS:\n${JSON.stringify(volunteers)}`;
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 1000 })
    });
    const data = await groqRes.json();
    if (!groqRes.ok) return res.status(500).json({ error: data.error?.message, details: data });
    const text = data.choices?.[0]?.message?.content || "[]";
    const matches = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json({ matches });
  } catch (err) { return res.status(500).json({ error: err.message }); }
};
