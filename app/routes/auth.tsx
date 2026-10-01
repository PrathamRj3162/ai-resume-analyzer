import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta() {
  return [
    { title: "Sign in — resumind" },
    { name: "description", content: "Sign in to get started" },
  ];
}

export default function Auth() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  useEffect(() => {
    if (!isLoading && auth.isAuthenticated) navigate(next);
  }, [isLoading, auth.isAuthenticated, next]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="w-full max-w-sm fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <p className="brand text-2xl mb-2">
            resumind<span>.</span>
          </p>
          <p className="text-stone-500 text-sm">
            Honest feedback for your next application.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <h1 className="text-lg font-semibold text-stone-800 mb-1">
            Welcome back
          </h1>
          <p className="text-stone-400 text-sm mb-6">
            Sign in with your Puter account to access your resumes and AI analysis.
          </p>

          {isLoading ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              Checking session...
            </div>
          ) : (
            <button
              onClick={auth.signIn}
              className="btn-primary w-full py-3"
            >
              Continue with Puter
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}

          <p className="text-xs text-stone-400 mt-4 leading-relaxed">
            Puter gives you free auth, cloud storage, and AI. No credit card, no API keys.
          </p>
        </div>
      </div>
    </div>
  );
}
