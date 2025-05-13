const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { transcript } = req.body;

  const summary = {
    sections: [
      {
        title: "Meeting Overview",
        content: "The meeting covered various updates and team goals.",
      },
      {
        title: "Key Points",
        content: "• Discussed product roadmap.\n• Outlined deliverables.\n• Assigned tasks.",
      },
      {
        title: "Next Steps",
        content: "Each team member to follow up on their respective tasks by next week.",
      },
    ],
  };

  res.json(summary);
});

module.exports = router;
