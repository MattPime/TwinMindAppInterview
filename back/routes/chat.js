router.post('/chat', async (req, res) => {
  const { transcript, question } = req.body;

  const messages = [
    { role: "system", content: "You are a helpful assistant helping summarize meeting notes." },
    { role: "user", content: `Transcript: ${transcript}\n\nQuestion: ${question}` }
  ];

  try {
    const chat = await openai.createChatCompletion({
      model: "gpt-4",
      messages,
    });
    res.json({ response: chat.data.choices[0].message.content });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});


