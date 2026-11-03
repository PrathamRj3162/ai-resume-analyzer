import { describe, expect, it } from "vitest";
import { computeKeywordMatch, extractKeywords } from "./keywordMatch";

describe("extractKeywords", () => {
  it("drops stopwords, short words and pure numbers", () => {
    const jd = "We need 5+ years of experience with the Python and SQL stack";
    expect(extractKeywords(jd)).toEqual(["need", "python", "sql", "stack"]);
  });

  it("ranks by frequency, then alphabetically", () => {
    const jd = "python python python java sql docker aws";
    expect(extractKeywords(jd)).toEqual(["python", "aws", "docker", "java", "sql"]);
  });

  it("keeps c++ and c# and strips the .js suffix", () => {
    const jd = "C++ C# Node.js React.js Vue.js";
    expect(extractKeywords(jd)).toEqual(["c#", "c++", "node", "react", "vue"]);
  });

  it("caps the list at 30 keywords", () => {
    const jd = Array.from({ length: 50 }, (_, i) => "tool" + String.fromCharCode(97 + (i % 26)) + Math.floor(i / 26)).join(" ");
    expect(extractKeywords(jd)).toHaveLength(30);
  });
});

describe("computeKeywordMatch", () => {
  it("returns null when the job description has fewer than 5 keywords", () => {
    expect(computeKeywordMatch("We need a React developer.", "React")).toBeNull();
  });

  it("scores partial overlap and lists matched and missing keywords", () => {
    const jd = "React TypeScript Node.js PostgreSQL Docker AWS";
    const resume = "Built apps with React and TypeScript on Node.js, deployed using Docker.";
    expect(computeKeywordMatch(jd, resume)).toEqual({
      score: 67,
      total: 6,
      matched: ["docker", "node", "react", "typescript"],
      missing: ["aws", "postgresql"],
    });
  });

  it("is case-insensitive and understands c++ / c#", () => {
    const jd = "C++ C# Python Java Kubernetes Terraform";
    const result = computeKeywordMatch(jd, "Wrote c++ and C# services.");
    expect(result?.score).toBe(33);
    expect(result?.matched).toEqual(["c#", "c++"]);
  });

  it("matches simple plurals in either direction", () => {
    const jd = "microservices APIs containers testing pipelines";
    const resume = "Designed a microservice, an api, one container, testing, and a pipeline.";
    expect(computeKeywordMatch(jd, resume)?.score).toBe(100);
  });

  it("treats React.js and React as the same keyword", () => {
    const jd = "React.js Vue.js Next.js Express TypeScript";
    expect(computeKeywordMatch(jd, "React Vue Next Express TypeScript")?.score).toBe(100);
  });

  it("is deterministic", () => {
    const jd = "React TypeScript Node.js PostgreSQL Docker AWS";
    expect(computeKeywordMatch(jd, "react")).toEqual(computeKeywordMatch(jd, "react"));
  });
});
