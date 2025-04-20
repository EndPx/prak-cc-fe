"use client";

import { useCallback, useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebase";
import { useRouter } from "next/navigation";

const auth = getAuth(app);

export default function NotesPage() {
  const router = useRouter();

  interface Note {
    id: number;
    title: string;
    content: string;
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log(API_BASE_URL)
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/notes`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Gagal mengambil catatan.");
      const data: Note[] = await res.json();
      setNotes(data);
    } catch (err) {
      console.log(err);
      setError("Gagal mengambil catatan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchToken = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
        fetchNotes(idToken);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil token. Silakan coba lagi.");
    }
  }, [router, fetchNotes]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  
  

  const addOrUpdateNote = async () => {
    if (!title || !content || !token) {
      setError("Judul dan konten tidak boleh kosong.");
      return;
    }

    setError(null);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${API_BASE_URL}/notes/${editId}`
        : `${API_BASE_URL}/notes`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error("Gagal menambah/memperbarui catatan.");

      fetchNotes(token);
      setTitle("");
      setContent("");
      setEditId(null);
    } catch (err) {
      console.log(err);
      setError("Gagal menyimpan catatan. Silakan coba lagi.");
    }
  };

  const deleteNote = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Gagal menghapus catatan.");
      fetchNotes(token!);
    } catch (err) {
      console.log(err);
      setError("Gagal menghapus catatan. Silakan coba lagi.");
    }
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditId(note.id);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.log(err);
      setError("Gagal logout. Silakan coba lagi.");
    }
  };

  return (
    <div className="container-fluid min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Catatan Saya</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mb-6"
      >
        Logout
      </button>
      <div className="w-full max-w-lg">
        <input
          type="text"
          placeholder="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded bg-gray-800 text-white"
        />
        <textarea
          placeholder="Konten"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded bg-gray-800 text-white"
        />
        <button
          onClick={addOrUpdateNote}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-2 rounded"
        >
          {editId ? "Perbarui Catatan" : "Tambah Catatan"}
        </button>
      </div>
      {loading ? (
        <p className="mt-6">Memuat...</p>
      ) : (
        <ul className="mt-6 w-full max-w-lg">
          {notes.length > 0 ? (
            notes.map((note) => (
              <li
                key={note.id}
                className="bg-gray-800 p-4 rounded-lg mb-4 shadow-lg"
              >
                <h2 className="font-bold text-xl mb-2 break-words">
                  {note.title}
                </h2>
                <p className="text-gray-300">{note.content}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(note)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-400">Belum ada catatan.</p>
          )}
        </ul>
      )}
    </div>
  );
}
