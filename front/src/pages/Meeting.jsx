import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import ChatBox from "../components/ChatBox";

export default function Meeting() {
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const BACKEND_URL = "https://twinmindappinterview.onrender.com";

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);
    dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

    const detectSpeech = () => {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
      setIsSpeaking(avg > 10);
    };

    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = sendAudioChunk;
    mediaRecorderRef.current.start();

    intervalRef.current = setInterval(() => {
      detectSpeech();
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.start();
    }, 3000);

    setRecording(true);
  };

  const stopRecording = async () => {
    clearInterval(intervalRef.current);
    mediaRecorderRef.current.stop();
    setRecording(false);
    localStorage.setItem("finalTranscript", transcript);

    // 🔒 Save transcript to Firestore
    const user = auth.currentUser;
    if (user && transcript.trim()) {
      const ref = doc(db, "meetings", `${user.uid}_${Date.now()}`);
      await setDoc(ref, {
        uid: user.uid,
        transcript,
        createdAt: serverTimestamp(),
      });
    }

    navigate("/summary");
  };

  const sendAudioChunk = async () => {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });
    audioChunks.current = [];

    const formData = new FormData();
    formData.append("audio", blob);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BACKEND_URL}/api/asr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.transcript) {
        setTranscript((prev) => prev + "\n" + data.transcript);
      }
    } catch (err) {
      console.error("ASR error:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Meeting in Progress</h1>

      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded text-white ${
          recording ? "bg-red-500" : "bg-green-600"
        }`}
      >
        {recording ? "Stop Meeting" : "Start Meeting"}
      </button>

      {recording && (
        <div className="mt-2 text-sm text-red-600">🎙️ Recording... Simulated transcript active.</div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap h-48 overflow-y-auto">
          {transcript}
        </pre>
      </div>

      <ChatBox transcript={transcript} />
    </div>
  );
}
