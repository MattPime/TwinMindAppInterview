import { GoogleAuthProvider, signInWithPopup, auth, provider } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const handleLogin = async () => {
  const provider = new GoogleAuthProvider();

  //Force account selection each time
  provider.setCustomParameters({
    prompt: "select_account"
  });

  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    // Do something with result.user
  } catch (error) {
    console.error("Login failed:", error);
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
