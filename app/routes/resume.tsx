import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Review — resumind" },
  { name: "description", content: "Detailed review of your resume" },
];

const ResumePage = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      if (!auth.isAuthenticated || !id) return;
      setLoadingData(true);
      try {
        const stored = await kv.get(`resume:${id}`);
        if (!stored) return;
        const data: Resume = JSON.parse(stored);
        setResumeData(data);
        setFeedback(data.feedback);

        const resumeBlob = await fs.read(data.resumePath);
        if (resumeBlob) {
          setResumeUrl(URL.createObjectURL(new Blob([resumeBlob], { type: "application/pdf" })));
        }
        const imageBlob = await fs.read(data.imagePath);
        if (imageBlob) {
          setImageUrl(URL.createObjectURL(imageBlob));
        }
      } catch (e) {
        console.error("Failed to load resume:", e);
      } finally {
        setLoadingData(false);
      }
    };
    loadResume();
  }, [auth.isAuthenticated, id]);

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-cream)" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-400 text-sm">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (!feedback || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-cream)" }}>
        <div className="text-center">
          <p className="text-stone-500 mb-3">Couldn't find that resume.</p>
          <Link to="/" className="text-sm text-stone-400 hover:text-stone-700 underline underline-offset-2">
            ← Go home
          </Link>
        </div>
      </div>
    );
  }

  const score = feedback.overallScore;
  const scoreLabel = score >= 70 ? "Strong resume" : score >= 50 ? "Good start" : "Needs work";
  const scoreColor = score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      {/* Slim topbar */}
      <header className="bg-white border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="brand text-base">
            resumind<span style={{ color: "var(--color-accent)" }}>.</span>
          </Link>
          <span className="text-stone-300 text-sm">|</span>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-stone-700 leading-tight">
              {resumeData.jobTitle}
            </p>
            <p className="text-xs text-stone-400">{resumeData.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resumeUrl && (
            <a href={resumeUrl} download={`resume.pdf`} className="btn-ghost text-xs">
              Download PDF
            </a>
          )}
          <Link to="/" className="btn-ghost text-xs">
            ← All resumes
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Score headline — quick read at a glance */}
        <div className="mb-8 fade-up">
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-stone-300 text-2xl font-light">/100</span>
            <span className={`text-sm font-medium ${scoreColor} ml-1`}>— {scoreLabel}</span>
          </div>
          {feedback.summary && (
            <p className="text-stone-500 text-sm mt-2 max-w-2xl leading-relaxed">
              {feedback.summary}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: resume thumbnail */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden sticky top-6 fade-up">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Resume preview"
                  className="w-full object-top object-cover"
                />
              ) : (
                <div className="h-96 flex items-center justify-center bg-stone-50">
                  <p className="text-stone-300 text-sm">No preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: feedback */}
          <div className="lg:col-span-3 space-y-5">
            <div className="fade-up" style={{ animationDelay: "60ms" }}>
              <Summary feedback={feedback} />
            </div>
            <div className="fade-up" style={{ animationDelay: "120ms" }}>
              <ATS score={feedback.ATS.score} suggestions={feedback.ATS.tips} />
            </div>
            <div className="fade-up" style={{ animationDelay: "180ms" }}>
              <Details feedback={feedback} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumePage;
