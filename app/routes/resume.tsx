import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind | Review" },
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

        // Load PDF blob
        const resumeBlob = await fs.read(data.resumePath);
        if (resumeBlob) {
          const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
          setResumeUrl(URL.createObjectURL(pdfBlob));
        }

        // Load image blob
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading resume analysis...</p>
        </div>
      </div>
    );
  }

  if (!feedback || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">Resume not found</p>
          <Link
            to="/"
            className="mt-4 inline-block text-indigo-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="text-2xl font-bold text-gradient"
            >
              RESUMIND
            </Link>
            <p className="text-sm text-gray-500 mt-0.5">
              {resumeData.jobTitle} @ {resumeData.companyName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {resumeUrl && (
              <a
                href={resumeUrl}
                download={`resume-${id}.pdf`}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Download PDF
              </a>
            )}
            <Link
              to="/"
              className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Summary banner */}
        {feedback.summary && (
          <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-indigo-700 mb-1">
              AI Summary
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {feedback.summary}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Resume preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-6">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Resume preview"
                  className="w-full object-top"
                />
              ) : (
                <div className="h-96 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No preview available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Feedback panels */}
          <div className="lg:col-span-2 space-y-6">
            <Summary feedback={feedback} />
            <ATS score={feedback.ATS.score} suggestions={feedback.ATS.tips} />
            <Details feedback={feedback} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumePage;
