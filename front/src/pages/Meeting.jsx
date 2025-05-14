import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";

export default function Meeting() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = sendAudioChunk;
      mediaRecorderRef.current.start();

      intervalRef.current = setInterval(() => {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.start();
      }, 30000);

      setRecording(true);
    } catch (err) {
      alert("Microphone access error: " + err.message);
    }
  };

  const stopRecording = () => {
    clearInterval(intervalRef.current);
    mediaRecorderRef.current.stop();
    setRecording(false);
    localStorage.setItem("finalTranscript", transcript);
    navigate("/summary");
  };

const sendAudioChunk = async () => {
  console.log("Sending audio chunk...");
  const blob = new Blob(audioChunks.current, { type: "audio/webm" });
  audioChunks.current = [];

  const formData = new FormData();
  formData.append("audio", blob);

  const token = localStorage.getItem("token");
  const res = await fetch("https://twinmind-backend.onrender.com/api/asr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  console.log("Transcript chunk received:", data.transcript);
  setTranscript((prev) => prev + "\n" + data.transcript);
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Meeting in Progress</h1>
      <button
        className={`px-4 py-2 rounded text-white ${recording ? "bg-red-500" : "bg-green-600"}`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop Recording" : "Start Meeting"}
      </button>
      <div className="mt-6">
        <h2 className="font-semibold text-lg mb-2">Transcript:</h2>
        <pre className="bg-gray-100 p-4 rounded h-60 overflow-y-auto whitespace-pre-wrap">
          {transcript}
        </pre>
      </div>
      <ChatBox transcript={transcript} />
    </div>
  );
}
