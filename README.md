# Resumind: Interactive Resume Analyzer & ATS Optimization Engine

A client-first career platform that analyzes resumes against target job descriptions. Resumind combines deep language-model evaluation (evaluating ATS readiness, tone, content impact, structure, and skills) with a **deterministic keyword-matching engine** computed entirely in the browser.

**Live Demo:** [resumind.vercel.app](https://ai-resume-analyzer-zeta-olive.vercel.app/)

---

## Key Highlights

- **Zero-Backend Architecture:** User authentication, cloud file storage (Puter FS), and key-value database records (Puter KV) execute client-side without dedicated server hosting costs.
- **In-Browser Document Parsing:** Extracts text layers from PDF files using PDF.js Web Workers. Rejects scanned or image-only documents lacking readable text to prevent wasted processing.
- **Deterministic Keyword Matching:** Pure algorithm extracting top frequency-weighted keywords from job descriptions, scoring match percentages, and reporting matched vs. missing terms.
- **5-Pillar Feedback Analysis:** Structured evaluation generating actionable recommendations across ATS Compatibility, Tone and Style, Quantified Content, Structural Layout, and Skills Relevance.
- **Resilient Pipeline:** Parallelizes document storage and text evaluation with timeout safeguards and schema validation to eliminate hanging state.
- **Automated Quality Gate:** 17 unit tests executed via Vitest and enforced through GitHub Actions continuous integration.

---

## Analysis Workflow

```
[ Upload PDF & Job Description ]
              │
              ├──> [ PDF.js Worker ] ──> Text Layer Extraction (<200 chars triggers scanned-file error)
              │
              ├──> [ Keyword Engine ] ──> Tokenize, Strip Stopwords, Score Overlap (Pure Algorithm)
              │
              └──> [ Parallel Processing ]
                        ├── Puter FS: Upload Original PDF & Rendered Page Preview
                        └── Review Engine: Structured 5-Category Feedback (JSON Schema Validated)
                                  │
                                  v
                    [ Puter KV: Persist Results ] ──> Route to Interactive Dashboard
```

1. **Extraction:** PDF.js reads document text layers. If extracted text is under 200 characters, it flags the document as scanned/image-only, prompting the user for a text-based export.
2. **Deterministic Overlap:** `computeKeywordMatch` compares job-description tokens against resume text using stopword filters and canonical stemming to produce an exact keyword score.
3. **Concurrent Execution:** The original PDF and a rendered canvas preview image are stored to Puter FS concurrently with the text evaluation stream (protected by a 90-second timeout).
4. **Response Validation:** `parseFeedback` extracts structured JSON, cleans code delimiters, and validates all five required categories, preventing malformed payloads from breaking the interface.
5. **Persistence:** The final evaluation, keyword metrics, and cloud storage references are saved to Puter KV under a unique session identifier before navigating to the results view.

---

## Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, React Router v7 (Single-Page Mode), TypeScript |
| **Document Processing** | PDF.js (`pdfjs-dist`) with dedicated Web Worker threads |
| **Cloud Services** | Puter.js (Client Authentication, Puter FS Storage, Puter KV Database) |
| **Styling & Icons** | Tailwind CSS v4, Lucide Icons |
| **State Management** | Zustand |
| **Testing & CI/CD** | Vitest (17 automated unit tests), GitHub Actions CI Quality Gate |
| **Hosting** | Vercel |

---

## Project Structure

```
app/
  ├── components/       # UI building blocks (ATS Score, KeywordMatch, Gauges, FileUploader)
  ├── constants/        # Review instructions, rubric prompts, and system guidelines
  ├── lib/              # Core logic and utilities
  │     ├── keywordMatch.ts       # Tokenizer, stopword filter, and keyword overlap algorithm
  │     ├── keywordMatch.test.ts  # Unit tests for keyword matching
  │     ├── parseFeedback.ts      # Schema validator for review payloads
  │     ├── parseFeedback.test.ts # Unit tests for parser validation
  │     ├── pdf2img.ts            # PDF.js text extraction and canvas preview renderer
  │     └── puter.ts              # Zustand store for Puter cloud storage, auth, and KV
  └── routes/           # Application views (home, upload, resume review, authentication, wipe)
```

---

## Getting Started Locally

### Prerequisites

- Node.js (v18 or newer)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/PrathamRj3162/ai-resume-analyzer.git
cd ai-resume-analyzer

# Install dependencies
npm ci

# Launch local development server
npm run dev

# Run automated unit tests
npm test

# Type-check application code
npm run typecheck

# Build for production
npm run build
```

---

## Quality Gate & Continuous Integration

Every commit and pull request to `main` triggers automated GitHub Actions workflow checks:
1. **Dependency Installation:** `npm ci` with clean reproducible lockfile resolution.
2. **Type Checking:** Complete TypeScript verification through `react-router typegen && tsc`.
3. **Unit Tests:** Vitest suite running 17 tests across parser validation and keyword matching logic.
4. **Production Build:** `react-router build` verifying asset bundling and SPA client outputs.

---

## Engineering Design Notes

- **Deterministic vs. Heuristic Scoring:** While category feedback is generated by language models, the keyword match percentage is completely deterministic—the same inputs consistently yield identical scores.
- **Fail-Fast Error Handling:** Scanned documents, network interruptions, and malformed responses surface clear feedback to the user rather than leaving UI spinners indefinitely active.
- **Client Security:** File processing happens in client memory before storage, ensuring sensitive career data remains scoped to user-authorized cloud storage buckets.
