import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { transcript, query } = req.body;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  const responseChunks = [
    "That's a great question. ",
    "Based on the transcript, ",
    "it looks like the team discussed key deliverables. ",
    "Let me summarize them for you. ",
  ];

  for (const chunk of responseChunks) {
    res.write(chunk);
    await new Promise((r) => setTimeout(r, 500));
  }

  res.end();
});

export default router;
