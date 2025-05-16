import { signInWithPopup, auth, GoogleAuthProvider } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    await signInWithPopup(auth, provider);
    // Navigate to dashboard or meeting page
  } catch (error) {
    console.error("Login error:", error);
  }
};


  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow"
      >
        Sign in with Google
      </button>
    </div>
  );
}
