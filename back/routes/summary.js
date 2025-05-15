import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const transcript = req.body.transcript || "";

  // Return simulated summary sections
  res.json({
    sections: [
      {
        title: "Meeting Overview",
        content: "This meeting focused on progress updates and planning for the next sprint.",
      },
      {
        title: "Key Points",
        content: "- Project is on track\n- Discussed UI improvements\n- Reviewed pending tasks",
      },
      {
        title: "Next Steps",
        content: "- Finalize API integration\n- Start QA testing\n- Schedule client review",
      },
    ],
  });
});

export default router;
