import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ dest: "temp/" }); // Save uploaded audio temporarily

router.post("/api/asr", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    const audioPath = req.file.path;
    // Log file info
    console.log("Received audio file:", req.file);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioPath));
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");
    formData.append("language", "en");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log("OpenAI Whisper response:", data);

    fs.unlinkSync(audioPath);

    if (data.error) {
      console.error("OpenAI Whisper error:", data.error);
      return res.status(500).json({ error: "OpenAI Whisper failed", details: data.error });
    }

    res.json({ transcript: data.text });
  } catch (err) {
    console.error("Unexpected ASR error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});


export default router;
