/**
 * Unit test for Firebase Google Authentication
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

describe("Authentication Flow", () => {
  test("GoogleAuthProvider should initialize", () => {
    const provider = new GoogleAuthProvider();
    expect(provider).toBeDefined();
  });

  test("Firebase Auth should initialize", () => {
    const app = initializeApp({ apiKey: "dummy", authDomain: "dummy" });
    const auth = getAuth(app);
    expect(auth).toBeDefined();
  });
});
