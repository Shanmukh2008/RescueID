const express = require('express');
const Groq = require('groq-sdk');

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post('/summary', async (req, res) => {
  try {
    const { profile } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
      ]
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

module.exports = router;