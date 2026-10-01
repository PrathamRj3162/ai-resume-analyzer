import React from "react";
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

interface CategoryProps {
  title: string;
  score: number;
}

const Category = ({ title, score }: CategoryProps) => {
  const textColor =
    score >= 70
      ? "text-green-600"
      : score >= 49
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-base font-medium text-gray-700">{title}</p>
          <ScoreBadge score={score} />
        </div>
        <p className={`text-base font-bold ${textColor}`}>{score}/100</p>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            score >= 70
              ? "bg-green-500"
              : score >= 49
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

interface SummaryProps {
  feedback: Feedback;
}

const Summary: React.FC<SummaryProps> = ({ feedback }) => {
  const { overallScore, ATS, toneAndStyle, content, structure, skills } =
    feedback;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <ScoreGauge score={overallScore} />
        <h2 className="text-xl font-bold mt-3 text-gray-800">
          Overall Resume Score
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {overallScore >= 70
            ? "Great work! Your resume is well-optimized."
            : overallScore >= 49
            ? "Good start! Some improvements can boost your score."
            : "Needs work. Follow the tips below to improve."}
        </p>
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        <Category title="ATS Compatibility" score={ATS.score} />
        <Category title="Tone & Style" score={toneAndStyle.score} />
        <Category title="Content Quality" score={content.score} />
        <Category title="Structure & Layout" score={structure.score} />
        <Category title="Skills Alignment" score={skills.score} />
      </div>
    </div>
  );
};

export default Summary;
