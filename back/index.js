import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const upload = multer({ dest: "temp/" }); // Save audio locally

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioPath));
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const result = await response.json();

    // Clean up temp file
    fs.unlinkSync(audioPath);

    res.json({ transcript: result.text });
  } catch (error) {
    console.error("Whisper API error:", error);
    res.status(500).json({ error: "Failed to transcribe audio." });
  }
});

export default router;
