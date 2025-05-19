import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import { auth, db } from "../services/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import ReactDOM from "react-dom/client";
import App from "../App.jsx";
import "../index.css";
import MeetingCard from "../components/MeetingCard";
import { useCalendarAuth } from "../services/CalendarAuthContext";

export default function Meeting() {
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pastMeetings, setPastMeetings] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const { isSignedIn, signIn, gapiLoaded } = useCalendarAuth();

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const BACKEND_URL = "https://twinmindappinterview.onrender.com";

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

      const detectSpeech = () => {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const avgVolume =
          dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
        setIsSpeaking(avgVolume > 10);
      };

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = sendAudioChunk;
      mediaRecorderRef.current.start();

      intervalRef.current = setInterval(() => {
        detectSpeech();
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.start();
      }, 3000);

      setRecording(true);
    } catch (err) {
      alert("Microphone access error: " + err.message);
    }
  };

  const stopRecording = async () => {
    try {
      clearInterval(intervalRef.current);
      mediaRecorderRef.current.stop();
      setRecording(false);

      localStorage.setItem("finalTranscript", transcript);
      const user = auth.currentUser;
      if (user && transcript.trim()) {
        const docRef = await addDoc(collection(db, "meetings"), {
          uid: user.uid,
          transcript,
          createdAt: serverTimestamp(),
          summary: null,
          });
        localStorage.setItem("meetingId", docRef.id);
      }
      navigate("/summary");
    } 
    catch (err) {
      console.error("stopRecording() failed:", err);
      alert("An error occurred while stopping the meeting:\n" + err.message);
    }
  };

 const sendAudioChunk = async () => {
  const blob = new Blob(audioChunks.current, { type: "audio/webm" });
  audioChunks.current = [];

  const formData = new FormData();
  formData.append("audio", blob);

  try {
    const res = await fetch("https://twinmindappinterview.onrender.com/api/asr", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("ASR response:", data);
    if (data.transcript) {
      setTranscript((prev) => prev + "\n" + data.transcript);
    }
  } catch (err) {
    console.error("ASR error:", err);
  }
};

  const connectCalendar = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setCalendarEvents(data.items || []);
      setCalendarConnected(true);
    } catch (err) {
      alert("Failed to connect to Google Calendar.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "meetings"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const meetings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPastMeetings(meetings);
    };
    fetchMeetings();
  }, []);

  useEffect(() => {
  if (gapiLoaded && !isSignedIn) {
    signIn(); // auto-sign in if token exists
    }
  }, [gapiLoaded, isSignedIn, signIn]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Meeting Dashboard</h1>
          <div className="flex gap-3">
            <div className="p-6">
              <h1 className="text-xl font-bold">Meeting Page</h1>
              <p>{isSignedIn ? "✅ Calendar Connected" : "❌ Not Connected"}</p>
            </div>
            <button onClick={handleSignOut} className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md">
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Live Meeting</h2>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`px-6 py-2 rounded-xl text-white font-semibold shadow-md transition ${recording ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
            >
              {recording ? "Stop Recording" : "Start Meeting"}
            </button>
            {recording && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Recording in progress…
              </div>
)}
          </div>


          <div className="mt-6 bg-white p-4 rounded-lg shadow text-gray-700">
          <h2 className="font-semibold text-lg mb-2">Transcript:</h2>
          <pre className="bg-white border rounded-xl p-4 shadow-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
            {transcript}
          </pre>
        </div>

        <ChatBox transcript={transcript} />
      </div>

        <div className="mt-10">
          <div className="grid gap-4">
            {pastMeetings.map((m) => (
            <MeetingCard key={m.id} id={m.id} createdAt={m.createdAt} />
            ))}
          </div>
        </div>

        {calendarConnected && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Upcoming Calendar Events</h2>
            <div className="grid gap-4">
              {calendarEvents.map((event) => (
                <div key={event.id} className="p-4 bg-gray-50 border rounded-xl shadow-sm">
                  <div className="font-semibold text-gray-800">{event.summary}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

