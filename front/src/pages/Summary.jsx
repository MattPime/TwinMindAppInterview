import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Summary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BACKEND_URL = "https://twinmindappinterview.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const transcript = localStorage.getItem("finalTranscript");

    if (!transcript) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
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

        // 🔒 Save summary to Firestore
        const user = auth.currentUser;
        if (user && data?.sections) {
          await addDoc(collection(db, "summaries"), {
            uid: user.uid,
            sections: data.sections,
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error("Summary error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div className="p-6">Loading summary...</div>;
  if (!summary || !summary.sections) return <div className="p-6 text-red-500">No summary available.</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/meeting")}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Back to Meeting
      </button>

      <h1 className="text-2xl font-semibold mb-4">Meeting Summary</h1>
      {summary.sections.map((section, i) => (
        <div key={i} className="mb-4">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="bg-gray-100 p-4 rounded whitespace-pre-line">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
