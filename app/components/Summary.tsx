import ScoreGauge from "./ScoreGauge";

interface SummaryProps {
  feedback: Feedback;
}

const categories = [
  { key: "ATS", label: "ATS compatibility" },
  { key: "toneAndStyle", label: "Tone & style" },
  { key: "content", label: "Content quality" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills match" },
] as const;

const Summary = ({ feedback }: SummaryProps) => {
  return (
    <div className="section-card">
      <div className="flex items-center gap-5 mb-6">
        <ScoreGauge score={feedback.overallScore} />
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-1">
            Overall score
          </p>
          <p className="text-stone-600 text-sm leading-relaxed max-w-xs">
            {feedback.overallScore >= 70
              ? "This resume is in good shape. A few tweaks and it's ready to send."
              : feedback.overallScore >= 50
              ? "Decent foundation. The details below will help you sharpen it."
              : "There's meaningful room for improvement — read the tips below."}
          </p>
        </div>
      </div>

      {/* Category scores */}
      <div className="space-y-3 pt-4 border-t border-stone-100">
        {categories.map(({ key, label }) => {
          const cat = feedback[key as keyof Feedback] as { score: number };
          const s = cat.score;
          const color =
            s >= 70 ? "bg-emerald-400" : s >= 50 ? "bg-amber-400" : "bg-red-400";
          const textColor =
            s >= 70 ? "text-emerald-600" : s >= 50 ? "text-amber-600" : "text-red-500";

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-stone-500 w-36 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-700`}
                  style={{ width: `${s}%` }}
                />
              </div>
              <span className={`text-sm font-semibold ${textColor} w-8 text-right tabular-nums`}>
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;
