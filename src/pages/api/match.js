\export default async function handler(req, res) {
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
    "name":