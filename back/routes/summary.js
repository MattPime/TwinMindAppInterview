import express from "express";
import fetch from "node-fetch"; // npm install node-fetch if needed
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post("/", async (req, res) => {
  const { transcript } = req.body;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You're a helpful assistant that summarizes meeting transcripts. Organize the summary into: Meeting Overview, Key Points, and Next Steps.",
          },
          {
            role: "user",
            content: transcript,
          },
        ],
        temperature: 0.7,
      }),
    });

    const result = await openaiRes.json();
    const rawSummary = result.choices[0].message.content;

    // Optionally parse into sections (or return raw)
    res.json({
      sections: [
        {
          title: "AI Summary",
          content: rawSummary,
        },
      ],
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;

