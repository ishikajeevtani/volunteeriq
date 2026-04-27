export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { need, volunteers } = req.body;

  if (!need || !volunteers || volunteers.length === 0) {
    return res.status(400).json({ error: "Missing need or volunteers" });
  }

  const prompt = `
You are a volunteer matching assistant for NGOs and NSS drives.

DRIVE:
Title: ${need.title}
Description: ${need.description}
Skills Required: ${need.skills_required}
Location: ${need.location}
Urgency: ${need.urgency}
Date: ${need.date}

VOLUNTEERS:
${volunteers.map((v, i) => `${i + 1}. Name: ${v.name}, Skills: ${v.skills}, Location: ${v.location}, Availability: ${v.availability}`).join("\n")}

Return ONLY a valid JSON array (no markdown, no explanation) of the top matched volunteers in this format:
[
  {
    "volunteer_id": "<id>",
    "name": "<name>",
    "match_score": <0-100>,
    "reason": "<one line reason>"
  }
]
Only include volunteers with a match_score above 40. Sort by match_score descending.
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(500).json({ error: data.error?.message || "Groq API error" });
    }

    const text = data.choices[0].message.content.trim();

    // Strip markdown fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    const matches = JSON.parse(clean);

    return res.status(200).json({ matches });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}