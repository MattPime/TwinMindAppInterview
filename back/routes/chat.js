import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { transcript, query } = req.body;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  const chunks = [
    "That's a great question. ",
    "Based on the transcript, ",
    "it seems the discussion focused on project progress. ",
    "Let me explain further... ",
  ];

  for (const chunk of chunks) {
    res.write(chunk);
    await new Promise((r) => setTimeout(r, 400));
  }

  res.end();
});

export default router;

