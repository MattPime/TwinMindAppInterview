import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  const { transcript } = req.body;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `You are an AI assistant. Summarize this transcript into sections with titles and bullet points:\n\n${transcript}`
        }
      ]
    });

    const content = chat.choices[0].message.content;

    // Wrap it in a fake section if you don’t want to parse
    res.json({
      sections: [
        { title: "Meeting Summary", content }
      ]
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Summary generation failed' });
  }
});

export default router;

