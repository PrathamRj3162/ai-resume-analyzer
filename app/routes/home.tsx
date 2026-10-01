import Navbar from "~/components/Navbar";
import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "resumind — AI resume feedback" },
    { name: "description", content: "Honest feedback for your next application." },
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
        setResumes(parsed.reverse());
      } catch (e) {
        console.error("Failed to load resumes:", e);
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();
  }, [auth.isAuthenticated]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 py-12">

        {/* Header row */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-2 font-medium">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold text-stone-900 leading-tight">
              Your resumes
            </h1>
            <p className="text-stone-500 mt-1 text-sm">
              {resumes.length > 0
                ? `${resumes.length} ${resumes.length === 1 ? "resume" : "resumes"} analyzed so far`
                : "Nothing here yet — upload your first resume below"}
            </p>
          </div>
          <Link to="/upload" className="btn-primary shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Analyze resume
          </Link>
        </div>

        {/* Resume grid */}
        {loadingResumes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-2xl h-72 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume, i) => (
              <div
                key={resume.id}
                className="fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ResumeCard resume={resume} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state — feels more personal */
          <div className="fade-up">
            <div className="border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center">
              <p className="text-4xl mb-4">📄</p>
              <h3 className="text-lg font-semibold text-stone-700 mb-1">
                No resumes yet
              </h3>
              <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
                Upload a resume and paste a job description to get honest, specific feedback in seconds.
              </p>
              <Link to="/upload" className="btn-primary">
                Upload your first resume
              </Link>
            </div>

            {/* How it works — subtle, not marketing-y */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { n: "1", title: "Upload your PDF", body: "Drop in your resume — it stays private in your Puter account." },
                { n: "2", title: "Paste the job description", body: "The AI tailors its feedback to the exact role you're applying to." },
                { n: "3", title: "Read the feedback", body: "You'll get scores and specific tips across 5 key areas." },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <span className="text-xl font-bold text-stone-200 shrink-0 mt-0.5">
                    {step.n}
                  </span>
                  <div>
                    <p className="font-medium text-stone-700 text-sm">{step.title}</p>
                    <p className="text-stone-400 text-xs mt-1 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
