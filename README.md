# Resumind: AI Resume Analyzer

Upload a PDF resume and a job description. Get an AI review (ATS, tone, content, structure, skills) plus a **deterministic keyword-match score** computed locally, with no AI involved.

**Live demo:** https://ai-resume-analyzer-zeta-olive.vercel.app/

## Features
- Sign in and store resumes per user with Puter.js (no custom backend).
- Extracts text from the PDF in the browser with pdf.js (first 3 pages).
- AI feedback in five categories with 2-3 short tips each (`gpt-4o-mini` through Puter).
- Keyword match: top keywords from the job description vs. your resume text, with matched and missing lists.
- Clear errors instead of endless spinners (scanned PDFs, bad AI replies, timeouts).
- Unit tests and a CI quality gate (type check, tests, build) on every push and pull request.

## How an analysis works
1. `loadPdf` and `extractPdfText` read the PDF in the browser. Under 200 characters means a scanned/image-only PDF, which is rejected with a readable error.
2. `computeKeywordMatch` compares job-description keywords with the resume text (pure function, fully tested).
3. In parallel: the PDF and a page-1 JPEG preview are uploaded to Puter storage, and the resume text is sent to the AI (90 s timeout).
4. `parseFeedback` strips code fences, extracts the JSON object and validates the five required categories. Invalid replies raise an error instead of crashing the UI.
5. One record (feedback + keyword match + file paths) is saved to Puter KV, then the app navigates to the results page.

## Tech stack
React Router v7 (SPA mode) · TypeScript · Tailwind CSS v4 · Zustand · pdf.js · Puter.js · Vitest · GitHub Actions · Vercel

## Project structure
```
app/
  routes/        home, auth, upload, resume, wipe
  components/    ATS, KeywordMatch and other UI pieces
  lib/           puter.ts (store), pdf2img.ts (pdf.js helpers),
                 keywordMatch.ts, parseFeedback.ts (+ unit tests)
  constants/     AI prompt and instructions
```

## Run locally
```bash
npm ci
npm run dev        # http://localhost:5173
npm run typecheck
npm test
npm run build
```

## Deployment and CI
- Vercel's GitHub integration deploys `main` automatically and creates preview deployments for pull requests.
- `.github/workflows/ci.yml` runs `npm ci`, type check, tests and build on every push and PR to `main`. It does not deploy.

## Limitations (honest list)
- The ATS score is the language model's estimate, not a real ATS simulation. The keyword score is the only fully deterministic number.
- Only extracted text is analyzed, so there is no feedback on visual layout, and scanned PDFs are rejected.
- Keyword matching is exact-token based (with simple plural handling and `.js` stripping). It does not know synonyms, so "JS" and "JavaScript" count as different words.
- Resume text is sent to a third-party AI through Puter. Do not upload anything you would not share with such a service.
- Only the first 3 PDF pages are read.
- The "wipe" page deletes all stored data for the app, not a single resume.
- Unit tests cover the pure logic. The Puter integration and UI are not covered by automated tests.

## Started from
This project started from the public "Resumind" tutorial (React Router + Puter.js). Changes I made on top of it:
- Fixed an analysis step that crashed silently and left the UI hanging (called a method that did not exist, with no error handling).
- Switched from sending a PDF image to sending extracted text, and parallelized uploads and the AI call.
- Added validated JSON parsing, error states and a timeout.
- Added the deterministic keyword-match feature, unit tests and the CI quality gate.
