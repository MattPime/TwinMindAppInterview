import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAssI8OwgrfjNJ5ZMKO0lloZisTUEvhvUg",
  authDomain: "twinmindappinterview.firebaseapp.com",
  projectId: "twinmindappinterview",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
