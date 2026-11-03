// Deterministic keyword overlap between a job description and resume text.
// No AI involved: same input always gives the same output.

export const MIN_KEYWORDS = 5;
export const MAX_KEYWORDS = 30;

const STOPWORDS = new Set([
  "the", "an", "and", "or", "of", "to", "in", "on", "for", "with", "as", "at",
  "by", "from", "is", "are", "be", "been", "being", "this", "that", "these",
  "those", "we", "you", "your", "our", "their", "they", "it", "its", "will",
  "can", "should", "must", "may", "have", "has", "had", "not", "but", "if",
  "than", "then", "also", "such", "who", "whom", "which", "what", "when",
  "where", "how", "all", "any", "each", "other", "more", "most", "some",
  "about", "into", "over", "under", "across", "within", "without", "between",
  "through", "per", "etc", "e.g", "i.e", "job", "role", "position",
  "candidate", "candidates", "team", "teams", "company", "work", "working",
  "works", "experience", "experienced", "years", "year", "strong", "ability",
  "able", "skills", "skill", "knowledge", "understanding", "responsibilities",
  "responsibility", "requirements", "required", "preferred", "plus",
  "including", "include", "includes", "using", "use", "used", "good", "great",
  "excellent", "new", "help", "looking", "join", "build", "building",
  "develop", "developing",
]);

// Short tokens that are real skills and must not be dropped by the length rule.
const SHORT_ALLOWED = new Set([
  "c", "r", "go", "ai", "ml", "ui", "ux", "qa", "js", "ci", "cd", "db", "c#", "c++",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter(Boolean);
}

function canonical(token: string): string {
  return token.length > 3 ? token.replace(/\.js$/, "") : token;
}

function isKeyword(token: string): boolean {
  if (STOPWORDS.has(token)) return false;
  if (!/[a-z]/.test(token)) return false; // pure numbers like "5+" or "3"
  return token.length >= 3 || SHORT_ALLOWED.has(token);
}

function variants(keyword: string): string[] {
  const out = [keyword, keyword + "s"];
  if (keyword.endsWith("s") && keyword.length > 3) out.push(keyword.slice(0, -1));
  return out;
}

export function extractKeywords(jobDescription: string): string[] {
  const counts = new Map<string, number>();
  for (const raw of tokenize(jobDescription)) {
    const token = canonical(raw);
    if (!isKeyword(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, MAX_KEYWORDS)
    .map(([word]) => word);
}

export function computeKeywordMatch(
  jobDescription: string,
  resumeText: string
): KeywordMatchResult | null {
  const keywords = extractKeywords(jobDescription);
  if (keywords.length < MIN_KEYWORDS) return null;

  const resumeTokens = new Set(tokenize(resumeText).map(canonical));
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    if (variants(keyword).some((v) => resumeTokens.has(v))) matched.push(keyword);
    else missing.push(keyword);
  }

  return {
    score: Math.round((matched.length / keywords.length) * 100),
    total: keywords.length,
    matched,
    missing,
  };
}
