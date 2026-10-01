import Navbar from "~/components/Navbar";
import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/");
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      if (!auth.isAuthenticated) return;
      setLoadingResumes(true);

      try {
        const items = (await kv.list("resume:*", true)) as KVItem[];
        const parsed: Resume[] = items
          .filter((item) => item.value)
          .map((item) => JSON.parse(item.value));
        setResumes(parsed);
      } catch (e) {
        console.error("Failed to load resumes:", e);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [auth.isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Your AI Resume{" "}
            <span className="text-gradient">Analyzer</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Upload your resume, get instant AI-powered feedback tailored to the
            job you're applying for.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Analyze New Resume
          </Link>
        </div>

        {/* Resumes grid */}
        {loadingResumes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : resumes.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Analyzed Resumes ({resumes.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700">
              No resumes yet
            </h3>
            <p className="text-gray-400 mt-2">
              Upload your first resume to get AI-powered feedback.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
