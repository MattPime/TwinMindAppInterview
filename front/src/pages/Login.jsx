import { signInWithPopup, auth, GoogleAuthProvider } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/meeting");
    }
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      navigate("/meeting");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* Project Title */}
      <h1 className="text-4xl font-bold text-blue-600 mb-2">TwinMind Web App Assignment</h1>

      {/* Author Name */}
      <p className="text-gray-600 mb-8 text-sm">by Matthew Pimentel</p>
      
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow"
      >
        Sign in with Google
      </button>
    </div>
  );
}

