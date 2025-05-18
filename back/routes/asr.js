import express from 'express';
import multer from 'multer';
import fs from 'fs';
import OpenAI from 'openai';

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}.webm`);
  }
});
const upload = multer({ storage });


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
    });

    fs.unlinkSync(req.file.path); // clean up temp file
    res.json({ transcript: response.text });
  } catch (err) {
    console.error("Whisper error:", err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Whisper transcription failed' });
  }
});

export default router;

