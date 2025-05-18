import express from 'express';
import multer from 'multer';
import OpenAI from "openai";
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
    });

    fs.unlinkSync(req.file.path);
    res.json({ transcript: transcription.text });
  } catch (err) {
    console.error("Whisper API error:", err);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

export default router;

