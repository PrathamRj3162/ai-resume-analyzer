import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";
import ScoreBadge from "./ScoreBadge";

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row gap-4 items-center py-2">
      <p className="text-lg font-semibold text-gray-800">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

interface TipItemProps {
  type: "good" | "improve";
  tip: string;
}

const TipItem = ({ type, tip }: TipItemProps) => {
  const isGood = type === "good";
  return (
    <li
      className={cn(
        "flex gap-3 items-start text-sm rounded-lg px-3 py-2.5",
        isGood
          ? "bg-green-50 text-green-800"
          : "bg-amber-50 text-amber-900"
      )}
    >
      <span className={cn("text-base shrink-0", isGood ? "text-green-500" : "text-amber-500")}>
        {isGood ? "✓" : "→"}
      </span>
      <span>{tip}</span>
    </li>
  );
};

interface DetailsCategoryProps {
  id: string;
  title: string;
  score: number;
  tips: { type: "good" | "improve"; tip: string }[];
}

const DetailsCategory = ({ id, title, score, tips }: DetailsCategoryProps) => {
  return (
    <AccordionItem id={id}>
      <AccordionHeader id={id}>
        <CategoryHeader title={title} categoryScore={score} />
      </AccordionHeader>
      <AccordionContent id={id}>
        <ul className="space-y-2">
          {tips.map((tip, idx) => (
            <TipItem key={idx} type={tip.type} tip={tip.tip} />
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

interface DetailsProps {
  feedback: Feedback;
}

const Details = ({ feedback }: DetailsProps) => {
  const categories = [
    { id: "tone", title: "Tone & Style", data: feedback.toneAndStyle },
    { id: "content", title: "Content Quality", data: feedback.content },
    { id: "structure", title: "Structure & Layout", data: feedback.structure },
    { id: "skills", title: "Skills Alignment", data: feedback.skills },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Detailed Feedback
      </h2>
      <Accordion defaultOpen="tone" allowMultiple>
        {categories.map((cat) => (
          <DetailsCategory
            key={cat.id}
            id={cat.id}
            title={cat.title}
            score={cat.data.score}
            tips={cat.data.tips}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default Details;
