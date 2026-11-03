import React from "react";

interface KeywordMatchProps {
  result: KeywordMatchResult | null;
}

const KeywordMatch: React.FC<KeywordMatchProps> = ({ result }) => {
  if (!result) return null;

  const { score, total, matched, missing } = result;

  const labelColor =
    score >= 70 ? "text-emerald-600" :
    score >= 50 ? "text-amber-600" :
    "text-red-500";

  return (
    <div className="section-card">
      <div className="mb-5">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-1">
          Job description keyword match
        </p>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${labelColor}`}>{score}%</span>
          <span className="text-stone-400 text-sm">
            {matched.length} of {total} keywords found
          </span>
        </div>
        <p className="text-xs text-stone-400 mt-1">
          Calculated by exact keyword overlap, not by AI.
        </p>
      </div>

      <div className="space-y-4">
        {matched.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 font-medium mb-2">Found in your resume</p>
            <ul className="flex flex-wrap gap-2">
              {matched.map((word) => (
                <li
                  key={word}
                  className="px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {word}
                </li>
              ))}
            </ul>
          </div>
        )}

        {missing.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 font-medium mb-2">Missing from your resume</p>
            <ul className="flex flex-wrap gap-2">
              {missing.map((word) => (
                <li
                  key={word}
                  className="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {word}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordMatch;
