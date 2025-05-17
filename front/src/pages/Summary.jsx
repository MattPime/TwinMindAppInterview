import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function Summary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BACKEND_URL = "https://twinmindappinterview.onrender.com"; 

  useEffect(() => {
    const fetchAndSaveSummary = async () => {
      const token = localStorage.getItem("token");
      const transcript = localStorage.getItem("finalTranscript");
      const meetingId = localStorage.getItem("meetingId");

      if (!transcript || !transcript.trim()) {
        console.warn("No transcript found.");
        setLoading(false);
        return;
      }

      try {
        // Step 1: Fetch summary from backend
        const res = await fetch(`${BACKEND_URL}/api/summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transcript }),
        });

        const data = await res.json();
        setSummary(data);
        setLoading(false);

        // Step 2: Save to Firestore
        const user = auth.currentUser;
        if (user && meetingId && data?.sections) {
          const ref = doc(db, "meetings", meetingId);
          await updateDoc(ref, {
            summary: data.sections,
          });
        }
      } catch (err) {
        console.error("Summary fetch or save error:", err);
        setLoading(false);
      }
    };

    fetchAndSaveSummary();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading summary...</div>;
  }

  if (!summary || !summary.sections) {
return <div className="p-6 text-red-500">
      <button
        onClick={() => navigate("/meeting")}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Back to Meeting
      </button>

      No summary available.</div>;
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/meeting")}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Back to Meeting
      </button>

      <h1 className="text-2xl font-semibold mb-4">Meeting Summary</h1>

      {summary.sections.map((section, index) => (
        <div key={index} className="mb-4">
          <h2 className="text-lg font-semibold mb-1">{section.title}</h2>
          <p className="bg-gray-100 p-4 rounded whitespace-pre-line">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
