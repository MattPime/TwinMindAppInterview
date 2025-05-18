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
    const resp = await openai.createTranscription(
      fs.createReadStream(req.file.path),
      'whisper-1'
    );
    fs.unlinkSync(req.file.path); // cleanup
    res.json({ transcript: resp.data.text });
  } catch (err) {
    console.error("ASR error:", err.response?.data || err.message);
    res.status(500).json({ error: "ASR failed" });
  }
});

export default router;

