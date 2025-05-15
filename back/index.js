import express from "express";
import cors from "cors";
import multer from "multer";
import summaryRoutes from "./routes/summary.js";
import chatRoutes from "./routes/chat.js";
import asrRoute from "./routes/asr.js";

const app = express();

//Allow only Vercel frontend
app.use(cors({ origin: "https://twin-mind-app-interview.vercel.app/" }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.use(asrRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/summary", summaryRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
