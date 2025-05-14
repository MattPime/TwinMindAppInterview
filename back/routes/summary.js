import express from "express";
import fetch from "node-fetch";
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post("/", async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ error: "Transcript is required." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "Summarize the following meeting transcript. Structure it into: 1) Meeting Overview, 2) Key Points, 3) Next Steps.",
          },
          {
            role: "user",
            content: transcript,
          },
        ],
        temperature: 0.7,
      }),
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "Summary unavailable.";

    res.json({
      sections: [
        {
          title: "AI Summary",
          content,
        },
      ],
    });
  } catch (err) {
    console.error("OpenAI summary error:", err);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

export default router;


