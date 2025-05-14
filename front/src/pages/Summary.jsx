import { useEffect, useState } from "react";

export default function Summary() {
  const [summary, setSummary] = useState(null);

useEffect(() => {
  const fetchSummary = async () => {
    const token = localStorage.getItem("token");
    const transcript = localStorage.getItem("finalTranscript");

    if (!transcript || transcript.trim().length === 0) {
      console.warn("No transcript found for summary.");
      return;
    }

    try {
      const res = await fetch("https://twinmind-backend.onrender.com/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
  };

  fetchSummary();
}, []);



  if (!summary) return <p className="p-6">Loading summary...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Meeting Summary</h1>
      {summary.sections.map((section, idx) => (
        <div key={idx} className="mb-4">
          <h2 className="text-lg font-bold mb-1">{section.title}</h2>
          <p className="text-gray-700">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
