import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function MeetingDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const docRef = doc(db, "meetings", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    };
    fetch();
  }, [id]);

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meeting on {new Date(data.createdAt.seconds * 1000).toLocaleString()}</h1>
      
      <h2 className="text-xl font-semibold mt-4 mb-2">Transcript</h2>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{data.transcript}</pre>

      {data.summary?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Summary</h2>
          {data.summary.map((sec, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-bold text-gray-800">{sec.title}</h3>
              <p className="whitespace-pre-line">{sec.content}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
