import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export default function MeetingDetails() {
  const { id } = useParams();
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const transcriptDoc = await getDoc(doc(db, "meetings", id));
      if (transcriptDoc.exists()) {
        setTranscript(transcriptDoc.data().transcript);
      }

      const q = query(collection(db, "summaries"), where("uid", "==", transcriptDoc.data().uid));
      const snapshot = await getDocs(q);
      const summaries = snapshot.docs.map(doc => doc.data());

      // Assume most recent summary is the one for this meeting
      if (summaries.length) {
        setSummary(summaries[summaries.length - 1]);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="p-6">
      <Link to="/meeting" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Meetings
      </Link>

      <h1 className="text-2xl font-semibold mb-4">Meeting Details</h1>

      <h2 className="text-lg font-semibold mb-2">Transcript</h2>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap mb-6">{transcript}</pre>

      <h2 className="text-lg font-semibold mb-2">Summary</h2>
      {summary ? (
        summary.sections.map((sec, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="font-semibold">{sec.title}</h3>
            <p className="bg-gray-100 p-2 rounded whitespace-pre-line">{sec.content}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No summary found for this meeting.</p>
      )}
    </div>
  );
}
