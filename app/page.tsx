"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL + "/users";
console.log(baseUrl);

export default function AuthPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isSignUp ? `${baseUrl}/register` : `${baseUrl}/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();


      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan autentikasi");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      router.push("/note");
    } catch (err: any) {
      setError(err.message || "Gagal melakukan autentikasi. Cek kembali data Anda.");
    } finally {
      setLoading(false);
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
            type="text"
            placeholder="Username"
            className="p-2 border rounded bg-gray-700 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="text-center mt-4">
          {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => {
              setError(null);
              setIsSignUp(!isSignUp);
            }}
          >
            {isSignUp ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
