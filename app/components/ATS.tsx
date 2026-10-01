import React from "react";
import ScoreCircle from "~/components/ScoreCircle";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const gradientClass =
    score > 69
      ? "from-green-50"
      : score > 49
      ? "from-yellow-50"
      : "from-red-50";

  const subtitle =
    score > 69
      ? "Great ATS Compatibility!"
      : score > 49
      ? "Good Start — Room to Improve"
      : "Needs Significant Improvement";

  const goodSuggestions = suggestions.filter((s) => s.type === "good");
  const improveSuggestions = suggestions.filter((s) => s.type === "improve");

  return (
    <div
      className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <ScoreCircle score={score} />
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            ATS Compatibility Score
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Tips */}
      {goodSuggestions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
            <span>✅</span> What's Working
          </p>
          <ul className="space-y-2">
            {goodSuggestions.map((s, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2"
              >
                <span className="text-green-500 shrink-0">•</span>
                {s.tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improveSuggestions.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
            <span>💡</span> Areas to Improve
          </p>
          <ul className="space-y-2">
            {improveSuggestions.map((s, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-gray-700 bg-amber-50 rounded-lg px-3 py-2"
              >
                <span className="text-amber-500 shrink-0">•</span>
                {s.tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ATS;
