import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

export function meta() {
  return [
    { title: "Clear Data | Resumind" },
    { name: "description", content: "Clear all your resume data" },
  ];
}

export default function Wipe() {
  const { kv, auth } = usePuterStore();
  const navigate = useNavigate();
  const [isWiping, setIsWiping] = useState(false);
  const [done, setDone] = useState(false);

  const handleWipe = async () => {
    if (!auth.isAuthenticated) return;
    setIsWiping(true);
    try {
      await kv.flush();
      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (e) {
      console.error("Wipe error:", e);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-md p-10">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          {done ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                All data cleared!
              </h1>
              <p className="text-gray-500">Redirecting you to home...</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Clear All Data
              </h1>
              <p className="text-gray-500 mb-8">
                This will permanently delete all your analyzed resumes from
                storage. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/"
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleWipe}
                  disabled={isWiping}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isWiping ? "Clearing..." : "Yes, Clear All"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
