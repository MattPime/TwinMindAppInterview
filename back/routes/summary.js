router.post('/summary', async (req, res) => {
  const { transcript } = req.body;

  const prompt = `Here is a meeting transcript. Break it down into sections with titles and bullet point summaries:\n\n${transcript}`;

  try {
    const chat = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const text = chat.data.choices[0].message.content;

    // Optional: parse into sections if structured
    res.json({ sections: [{ title: "Summary", content: text }] });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Summary generation failed" });
  }
});
