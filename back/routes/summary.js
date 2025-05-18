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
          content: `Summarize the following meeting transcript into 3–5 clear sections. For each section:
- Start with a title (e.g., "Project Updates")
- Follow with 2–5 bullet points
- Use Markdown formatting
Transcript:\n\n${transcript}`
        }
      ]
    });

    const content = chat.choices[0].message.content;
    // Simple parser to split on section titles (e.g., ### Section)
const sections = rawText
  .split(/^#+\s*/gm)
  .map(chunk => chunk.trim())
  .filter(Boolean)
  .map(text => {
    const [titleLine, ...rest] = text.split('\n');
    return {
      title: titleLine.trim(),
      content: rest.join('\n').trim(),
    };
  });

res.json({ sections });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Summary generation failed' });
  }
});

export default router;

