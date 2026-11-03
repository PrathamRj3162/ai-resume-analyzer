const REQUIRED_CATEGORIES = [
  "ATS",
  "toneAndStyle",
  "content",
  "structure",
  "skills",
] as const;

// Turns the raw AI reply into a validated Feedback object, or throws a readable Error.
export function parseFeedback(raw: string): Feedback {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("The AI reply did not contain JSON. Please try again.");
  }

  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error("The AI reply was not valid JSON. Please try again.");
  }

  for (const key of REQUIRED_CATEGORIES) {
    if (!parsed?.[key] || !Array.isArray(parsed[key].tips)) {
      throw new Error(`The AI reply is missing the "${key}" section. Please try again.`);
    }
  }
  return parsed as Feedback;
}
