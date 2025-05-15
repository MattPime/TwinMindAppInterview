import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const dummyLines = [
  "Welcome to today's meeting.",
  "Let's review the project milestones.",
  "The timeline looks good for Q3 delivery.",
  "Any blockers we should discuss?",
  "Thanks everyone, great work!"
];

router.post("/api/asr", upload.single("audio"), async (req, res) => {
  const random = dummyLines[Math.floor(Math.random() * dummyLines.length)];
  res.json({ transcript: random });
});

export default router;
