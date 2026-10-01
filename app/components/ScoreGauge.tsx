const ScoreGauge = ({ score = 75 }: { score: number }) => {
  const pct = score / 100;
  // Semi-circle arc: radius 40, center 50,50, from (-40,0) to (40,0) relative
  const r = 38;
  const arcLen = Math.PI * r; // half circumference
  const offset = arcLen * (1 - pct);

  const color =
    score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-20 h-10 shrink-0">
      <svg viewBox="0 0 100 52" className="w-full h-full overflow-visible">
        {/* Track */}
        <path
          d="M 12 50 A 38 38 0 0 1 88 50"
          fill="none"
          stroke="#f5f5f4"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d="M 12 50 A 38 38 0 0 1 88 50"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      {/* Score number below arc */}
      <div
        className="absolute inset-x-0 bottom-0 text-center text-base font-bold tabular-nums"
        style={{ color }}
      >
        {score}
      </div>
    </div>
  );
};

export default ScoreGauge;
