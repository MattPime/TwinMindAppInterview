import express from "express";
import cors from "cors";
import multer from "multer";

import chatRoutes from "./routes/chat.js";
import summaryRoutes from "./routes/summary.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/asr", upload.single("audio"), (req, res) => {
  const dummyText = `Dummy transcript at ${new Date().toLocaleTimeString()}`;
  res.json({ transcript: dummyText });
});

app.use("/api/chat", chatRoutes);
app.use("/api/summary", summaryRoutes);

app.listen(port, () => console.log(`Server listening on port ${port}`));
