import { useState } from "react";

export default function ChatBox({ transcript }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://twinmindappinterview.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    const systemMsg = { role: "assistant", text: "" };
    setMessages((prev) => [...prev, systemMsg]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, query }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === prev.length - 1 ? { ...msg, text: result } : msg
          )
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, text: "ERROR from assistant" } : msg
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className="mt-6">
      <h2 className="font-semibold text-lg mb-2">Ask About the Meeting:</h2>
      <form onSubmit={handleSubmit} className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border rounded-l"
          placeholder="Ask a question..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-r"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      <div className="bg-gray-100 p-4 rounded h-60 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : ""}`}>
            <span
              className={`inline-block px-3 py-2 rounded ${
                msg.role === "user" ? "bg-blue-100" : "bg-white"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
