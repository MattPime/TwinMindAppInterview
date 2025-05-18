import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  const { transcript, question } = req.body;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant answering questions about meeting transcripts." },
        { role: "user", content: `Transcript: ${transcript}\n\nQuestion: ${question}` }
      ]
    });

    res.json({ response: chat.choices[0].message.content });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat API failed' });
  }
});

export default router;

