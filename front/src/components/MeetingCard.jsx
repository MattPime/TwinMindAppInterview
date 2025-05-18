import { Link } from "react-router-dom";

export default function MeetingCard({ id, createdAt }) {
  return (
    <Link
      to={`/meeting/${id}`}
      className="block p-4 bg-gray-100 border rounded-xl hover:shadow-md transition"
    >
      <div className="text-gray-800 font-medium">
        {new Date(createdAt?.seconds * 1000).toLocaleString()}
      </div>
      <div className="text-sm text-blue-600">View summary →</div>
    </Link>
  );
}
