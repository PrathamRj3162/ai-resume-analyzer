import React from "react";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const good = suggestions.filter((s) => s.type === "good");
  const improve = suggestions.filter((s) => s.type === "improve");

  const label =
    score >= 70 ? "Passes most ATS filters" :
    score >= 50 ? "May struggle with some ATS" :
    "Likely to be filtered out";

  const labelColor =
    score >= 70 ? "text-emerald-600" :
    score >= 50 ? "text-amber-600" :
    "text-red-500";

  return (
    <div className="section-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-1">
            ATS score
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${labelColor}`}>{score}</span>
            <span className="text-stone-300 font-light">/100</span>
          </div>
          <p className={`text-sm mt-0.5 ${labelColor}`}>{label}</p>
        </div>

        {/* Mini donut */}
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f5f5f4" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={score >= 70 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171"}
              strokeWidth="3"
              strokeDasharray={`${score} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${labelColor}`}>
            {score}
          </span>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-4">
        {good.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 font-medium mb-2">What's working</p>
            <ul className="space-y-1.5">
              {good.map((s, i) => (
                <li key={i} className="tip-good">
                  <span className="text-emerald-500 shrink-0 text-xs mt-0.5">✓</span>
                  <span className="leading-relaxed">{s.tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {improve.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 font-medium mb-2">Things to fix</p>
            <ul className="space-y-1.5">
              {improve.map((s, i) => (
                <li key={i} className="tip-improve">
                  <span className="text-amber-500 shrink-0 text-xs mt-0.5">→</span>
                  <span className="leading-relaxed">{s.tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATS;
