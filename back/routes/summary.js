import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { transcript } = req.body;
  console.log("Generating summary from:", transcript?.slice(0, 100));

  if (!transcript || transcript.length === 0) {
    return res.status(400).json({ error: "Empty transcript" });
  }

  const summary = {
    sections: [
      {
        title: "Meeting Overview",
        content: "This is a summary generated from your dummy transcript.",
      },
      {
        title: "Key Points",
        content: "- Point A\n- Point B\n- Point C",
      },
      {
        title: "Next Steps",
        content: "Follow-up by next week.",
      },
    ],
  };

  res.json(summary);
});

export default router;

