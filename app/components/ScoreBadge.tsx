import { cn } from "~/lib/utils";

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-full text-xs font-medium",
        score > 69
          ? "bg-badge-green text-badge-green-text"
          : score > 39
          ? "bg-badge-yellow text-badge-yellow-text"
          : "bg-badge-red text-badge-red-text"
      )}
    >
      <span>{score}/100</span>
    </div>
  );
};

export default ScoreBadge;
