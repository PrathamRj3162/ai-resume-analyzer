import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta() {
  return [
    { title: "Sign In | Resumind" },
    { name: "description", content: "Sign in to access your resume analyzer" },
  ];
}

export default function Auth() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  useEffect(() => {
    if (!isLoading && auth.isAuthenticated) {
      navigate(next);
    }
  }, [isLoading, auth.isAuthenticated, next]);

  const handleSignIn = async () => {
    await auth.signIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-gradient">RESUMIND</p>
            <p className="mt-2 text-gray-500 text-sm">
              AI-powered resume analysis
            </p>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 mb-8">
            Sign in with your Puter account to access your resumes and get
            AI-powered feedback.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full py-3 px-6 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In with Puter
            </button>
          )}

          <p className="mt-6 text-xs text-gray-400">
            Puter provides free auth, storage, and AI — no API key needed.
          </p>
        </div>
      </div>
    </div>
  );
}
