import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

interface DetailsProps {
  feedback: Feedback;
}

const categoryMap = [
  { id: "tone", label: "Tone & style", key: "toneAndStyle" },
  { id: "content", label: "Content quality", key: "content" },
  { id: "structure", label: "Structure", key: "structure" },
  { id: "skills", label: "Skills match", key: "skills" },
] as const;

const Details = ({ feedback }: DetailsProps) => {
  return (
    <div className="section-card">
      <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">
        Category breakdown
      </p>

      <Accordion defaultOpen="tone">
        {categoryMap.map(({ id, label, key }) => {
          const cat = feedback[key as keyof Feedback] as {
            score: number;
            tips: { type: "good" | "improve"; tip: string }[];
          };
          const s = cat.score;
          const textColor =
            s >= 70 ? "text-emerald-600" : s >= 50 ? "text-amber-600" : "text-red-500";
          const barColor =
            s >= 70 ? "bg-emerald-400" : s >= 50 ? "bg-amber-400" : "bg-red-400";

          return (
            <AccordionItem key={id} id={id}>
              <AccordionHeader id={id}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-700 truncate">{label}</span>
                  {/* Mini score pill */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${s}%` }} />
                    </div>
                    <span className={`text-xs font-semibold tabular-nums ${textColor}`}>{s}</span>
                  </div>
                </div>
              </AccordionHeader>

              <AccordionContent id={id}>
                <div className="space-y-1.5 pt-1 pb-2">
                  {cat.tips.map((tip, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2.5 items-start text-sm rounded-xl px-3 py-2.5",
                        tip.type === "good"
                          ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
                          : "bg-amber-50 border border-amber-100 text-amber-900"
                      )}
                    >
                      <span className={cn("shrink-0 mt-0.5 text-xs", tip.type === "good" ? "text-emerald-500" : "text-amber-500")}>
                        {tip.type === "good" ? "✓" : "→"}
                      </span>
                      <span className="leading-relaxed">{tip.tip}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Details;
