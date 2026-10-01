import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore();
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  useEffect(() => {
    const loadImage = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setResumeImageUrl(url);
    };
    loadImage();

    return () => {
      if (resumeImageUrl) URL.revokeObjectURL(resumeImageUrl);
    };
  }, [imagePath]);

  return (
    <Link
      to={`/resume/${id}`}
      className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Resume thumbnail */}
      <div className="relative h-48 bg-gray-50 overflow-hidden">
        {resumeImageUrl ? (
          <img
            src={resumeImageUrl}
            alt={`${companyName} resume`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
          </div>
        )}
        {/* Score overlay */}
        <div className="absolute top-3 right-3">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex-1">
        <p className="font-semibold text-gray-800 truncate">
          {jobTitle ?? "Unknown Role"}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {companyName ?? "Unknown Company"}
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {[
            { label: "ATS", score: feedback.ATS.score },
            { label: "Content", score: feedback.content.score },
            { label: "Skills", score: feedback.skills.score },
          ].map(({ label, score }) => (
            <span
              key={label}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                score > 69
                  ? "bg-green-100 text-green-700"
                  : score > 49
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {label}: {score}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;
