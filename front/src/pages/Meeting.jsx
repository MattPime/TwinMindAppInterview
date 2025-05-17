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
} from "firebase/firestore";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

export default function Meeting() {
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pastMeetings, setPastMeetings] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarConnected, setCalendarConnected] = useState(false);

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
    console.log("Stop Meeting button clicked");
    try {
      clearInterval(intervalRef.current);
      mediaRecorderRef.current.stop();
      setRecording(false);

      localStorage.setItem("finalTranscript", transcript);

      const user = auth.currentUser;
      if (user && transcript.trim()) {
        const ref = doc(db, "meetings", `${user.uid}_${Date.now()}`);
        await setDoc(ref, {
          uid: user.uid,
          transcript,
          createdAt: serverTimestamp(),
          summary: null,
        });
        localStorage.setItem("meetingId", ref.id);
      }

      navigate("/summary");
    } catch (err) {
      console.error("stopRecording() failed:", err);
      alert("An error occurred while stopping the meeting:\n" + err.message);
    }
  };

  const sendAudioChunk = async () => {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });
    audioChunks.current = [];

    const formData = new FormData();
    formData.append("audio", blob);

    const token = localStorage.getItem("token");
    console.log("🎤 Sending chunk to ASR...");

    try {
      const res = await fetch(`${BACKEND_URL}/api/asr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const connectCalendar = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Call Google Calendar API
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setCalendarEvents(data.items || []);
      setCalendarConnected(true);
    } catch (err) {
      console.error("Google Calendar connection failed:", err);
      alert("Failed to connect to Google Calendar.");
    }
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
      const meetings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPastMeetings(meetings);
    };

    fetchMeetings();
  }, []);

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Sign Out
          </button>

          <button
            onClick={connectCalendar}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {calendarConnected ? "Calendar Connected ✅" : "Connect Calendar"}
          </button>
        </div>

        <h1 className="text-2xl font-semibold mb-4">Meeting in Progress</h1>

        <button
          className={`px-4 py-2 rounded text-white ${
            recording ? "bg-red-500" : "bg-green-600"
          }`}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? "Stop Recording" : "Start Meeting"}
        </button>

        {recording && (
          <div className="mt-2 text-xs text-gray-500 italic">
            (Simulated transcription – OpenAI Whisper disabled)
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full transition ${
              isSpeaking ? "bg-green-500" : "bg-gray-300"
            }`}
          ></span>
          <span className="text-sm">
            {isSpeaking ? "Listening..." : "Waiting for voice..."}
          </span>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Transcript:</h2>
          <pre className="bg-gray-100 p-4 rounded h-60 overflow-y-auto whitespace-pre-wrap">
            {transcript}
          </pre>
        </div>

        <ChatBox transcript={transcript} />
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Past Meetings</h2>
        <ul className="space-y-2">
          {pastMeetings.map((meeting) => (
            <li key={meeting.id}>
              <Link
                to={`/meeting/${meeting.id}`}
                className="text-blue-600 hover:underline"
              >
                {new Date(meeting.createdAt?.seconds * 1000).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {calendarConnected && (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Upcoming Calendar Events</h2>
          <ul className="space-y-2">
            {calendarEvents.map((event) => (
              <li key={event.id} className="bg-gray-100 p-2 rounded">
                <div className="font-semibold">{event.summary}</div>
                <div className="text-sm text-gray-600">
                  {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

