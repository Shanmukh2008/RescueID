const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

router.post('/summary', async (req, res) => {
  try {
    const { profile } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping emergency paramedics. Give short, clear, and direct medical summaries. Maximum 3-4 sentences.'
        },
        {
          role: 'user',
          content: `Give a paramedic-friendly emergency summary for this patient:
- Name: ${profile.fullName}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Blood Group: ${profile.bloodGroup}
- Allergies: ${profile.allergies || 'None reported'}
- Current Medications: ${profile.medications || 'None reported'}
- Medical Conditions: ${profile.medicalConditions || 'None reported'}
- Emergency Contacts: ${profile.emergencyContacts?.map(c => `${c.name} (${c.relationship}): ${c.phone}`).join(', ') || 'None'}`
        }
      ],
      temperature: 1,
      top_p: 1,
      max_tokens: 1024,
      stream: false
    });

    const summary = completion.choices[0]?.message?.content;
    res.json({ summary });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

module.exports = router;