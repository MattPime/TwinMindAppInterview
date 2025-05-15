import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "temp/" }); // Save uploaded audio temporarily

router.post("/api/asr", upload.single("audio"), async (req, res) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    const audioPath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioPath));
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");
    formData.append("language", "en");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();

    // Clean up the temporary file
    fs.unlinkSync(audioPath);

    if (data.error) {
      console.error("Whisper error:", data.error);
      return res.status(500).json({ error: "OpenAI Whisper failed", detail: data.error });
    }

    res.json({ transcript: data.text });
  } catch (err) {
    console.error("ASR failure:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

export default router;
