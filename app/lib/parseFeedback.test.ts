import { describe, expect, it } from "vitest";
import { parseFeedback } from "./parseFeedback";

const category = { score: 80, tips: [{ type: "good", tip: "Clear." }] };
const valid = {
  overallScore: 75,
  summary: "Solid resume.",
  ATS: category,
  toneAndStyle: category,
  content: category,
  structure: category,
  skills: category,
};
const validJson = JSON.stringify(valid);

describe("parseFeedback", () => {
  it("parses plain JSON", () => {
    expect(parseFeedback(validJson).overallScore).toBe(75);
  });

  it("strips ```json fences", () => {
    expect(parseFeedback("```json\n" + validJson + "\n```").ATS.score).toBe(80);
  });

  it("ignores text before and after the JSON object", () => {
    const reply = "Here is your analysis:\n" + validJson + "\nHope this helps!";
    expect(parseFeedback(reply).skills.tips).toHaveLength(1);
  });

  it("throws when there is no JSON object", () => {
    expect(() => parseFeedback("Sorry, I cannot help with that.")).toThrow();
  });

  it("throws on malformed JSON", () => {
    expect(() => parseFeedback('{"overallScore": 75,')).toThrow();
  });

  it("throws when a required category is missing", () => {
    const { skills, ...rest } = valid;
    expect(() => parseFeedback(JSON.stringify(rest))).toThrow(/skills/);
  });

  it("throws when a category has no tips array", () => {
    const broken = { ...valid, content: { score: 50 } };
    expect(() => parseFeedback(JSON.stringify(broken))).toThrow(/content/);
  });
});
