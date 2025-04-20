"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../firebase";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/note");
    } catch (err) {
      console.log(err);
      setError("Gagal melakukan autentikasi. Cek kembali data Anda.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/note");
    } catch (err) {
      console.log(err);
      setError("Gagal login dengan Google.");
    }
  };

  return (
    <div className="container-fluid flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? "Sign Up" : "Login"}
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form className="flex flex-col gap-4" onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded bg-gray-700 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border rounded bg-gray-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded" type="submit">
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded mt-4 w-full"
        >
          Login dengan Google
        </button>
        <p className="text-center mt-4">
          {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
