import express from "express";
import cors from "cors";
import multer from "multer";

import summaryRoutes from "./routes/summary.js";
import chatRoutes from "./routes/chat.js";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
app.use(cors());
app.use(express.json());

// File upload middleware for ASR
const upload = multer({ dest: "temp/" });

// Whisper ASR Endpoint (OpenAI)
app.post("/api/asr", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioPath));
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");

    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const result = await openaiRes.json();
    fs.unlinkSync(audioPath); // Clean up

    res.json({ transcript: result.text });
  } catch (err) {
    console.error("ASR error:", err);
    res.status(500).json({ error: "Transcription failed." });
  }
});

// Additional routes
app.use("/api/chat", chatRoutes);
app.use("/api/summary", summaryRoutes);

// ✅ Required by Render to detect server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
