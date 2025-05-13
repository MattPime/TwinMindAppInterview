const express = require("express");
const cors = require("cors");
const multer = require("multer");
const chatRoutes = require("./routes/chat");
const summaryRoutes = require("./routes/summary");

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/asr", upload.single("audio"), (req, res) => {
  const dummyText = `Dummy transcript at ${new Date().toLocaleTimeString()}`;
  res.json({ transcript: dummyText });
});

app.use("/api/chat", chatRoutes);
app.use("/api/summary", summaryRoutes);

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
