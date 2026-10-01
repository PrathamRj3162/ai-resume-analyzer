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
      setResumeImageUrl(URL.createObjectURL(blob));
    };
    loadImage();
  }, [imagePath]);

  const score = feedback.overallScore;
  const scoreColor =
    score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500";

  return (
    <Link
      to={`/resume/${id}`}
      className="group flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-400 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-stone-50 overflow-hidden">
        {resumeImageUrl ? (
          <img
            src={resumeImageUrl}
            alt="Resume"
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-stone-200 animate-pulse" />
          </div>
        )}
        {/* Score chip — top left */}
        <div
          className={`absolute top-3 left-3 bg-white border border-stone-200 rounded-lg px-2 py-0.5 text-sm font-bold ${scoreColor} shadow-sm`}
        >
          {score}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="font-semibold text-stone-800 text-sm truncate leading-tight">
          {jobTitle ?? "Unknown role"}
        </p>
        <p className="text-xs text-stone-400 truncate mt-0.5 mb-3">
          {companyName ?? "Unknown company"}
        </p>

        {/* Mini category bars */}
        <div className="mt-auto space-y-1.5">
          {[
            { label: "ATS", score: feedback.ATS.score },
            { label: "Content", score: feedback.content.score },
            { label: "Skills", score: feedback.skills.score },
          ].map(({ label, score: s }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 w-12 shrink-0">{label}</span>
              <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    s >= 70 ? "bg-emerald-400" : s >= 50 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${s}%` }}
                />
              </div>
              <span className="text-[10px] text-stone-400 w-5 text-right">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;
