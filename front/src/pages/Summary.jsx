import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Summary() {
  const [summary, setSummary] = useState(null);
@@ -34,27 +36,35 @@
        const data = await res.json();
        console.log("Summary response:", data);
        setSummary(data);
        const user = auth.currentUser;
if (user && data?.sections) {
  await addDoc(collection(db, "summaries"), {
    uid: user.uid,
    sections: data.sections,
    createdAt: serverTimestamp(),
  });
}
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
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
