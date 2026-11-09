export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  companyName,
}: {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
}) => `
You are an expert technical resume reviewer. Analyze the resume text for:
- Role: ${jobTitle} at ${companyName}
- Job Description: ${jobDescription.slice(0, 1500)}

Return ONLY a minified valid JSON object with NO markdown, backticks, or commentary:
{
  "overallScore": <number 0-100>,
  "summary": "<Direct 2-sentence executive summary under 30 words>",
  "ATS": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<positive observation under 15 words>" },
      { "type": "improve", "tip": "<critical actionable fix under 15 words>" }
    ]
  },
  "toneAndStyle": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<positive observation under 15 words>" },
      { "type": "improve", "tip": "<critical actionable fix under 15 words>" }
    ]
  },
  "content": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<positive observation under 15 words>" },
      { "type": "improve", "tip": "<critical actionable fix under 15 words>" }
    ]
  },
  "structure": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<positive observation under 15 words>" },
      { "type": "improve", "tip": "<critical actionable fix under 15 words>" }
    ]
  },
  "skills": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<positive observation under 15 words>" },
      { "type": "improve", "tip": "<critical actionable fix under 15 words>" }
    ]
  }
}
`;
