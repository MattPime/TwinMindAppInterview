import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import { getAuth, signOut } from "firebase/auth";

export default function Meeting() {
  const [recording, setRecording] = useState(false);
@@ -93,60 +94,73 @@
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);

      // Redirect to login page
      navigate("/login");
    
    } catch (error) {
      console.error("Error signing out:", error);
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

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/Login")}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign Out
      </button>

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
  );
}
