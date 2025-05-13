import { useEffect, useState } from "react";

export default function Summary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript: localStorage.getItem("finalTranscript") || "" }),
      });

      const data = await res.json();
      setSummary(data);
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
