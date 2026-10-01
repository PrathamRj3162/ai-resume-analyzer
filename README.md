# Resumind — AI Resume Analyzer

> AI-powered resume analyzer built with React Router v7, TypeScript, Tailwind CSS v4, and [Puter.js](https://puter.com) for free auth, storage, and AI.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-resume-analyzer)

## ✨ Features

- 🤖 **AI-powered analysis** — Uses GPT-4o via Puter.js (no API key needed)
- 📄 **PDF upload** — Drag-and-drop resume upload with PDF.js preview
- 📊 **5-category scoring** — ATS, Tone & Style, Content, Structure, Skills
- 🔐 **Free auth & storage** — Powered by Puter.js (no backend needed)
- 🎨 **Beautiful UI** — Built with Tailwind CSS v4

## 🚀 Tech Stack

| Tech | Purpose |
|------|---------|
| React Router v7 | Full-stack framework (SSR + routing) |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Puter.js | Auth, filesystem, KV store, AI |
| PDF.js | PDF to image conversion |
| Zustand | State management |
| Vite | Build tool |

## 🏃 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer

# Install dependencies
npm install

# Start development server
npm run dev
```

Your app will be at [http://localhost:5173](http://localhost:5173).

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 🐳 Docker

```bash
docker build -t ai-resume-analyzer .
docker run -p 3000:3000 ai-resume-analyzer
```

## 🌐 Deploying to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set Framework Preset to **Other**
4. Build Command: `npm run build`
5. Output Directory: `build/client`
6. Install Command: `npm install`

## 📁 Project Structure

```
ai-resume-analyzer/
├── app/
│   ├── components/      # UI components
│   ├── constants/       # AI prompt templates
│   ├── lib/             # Puter store, utils, pdf2img
│   ├── routes/          # Page routes
│   ├── root.tsx         # App shell
│   └── app.css          # Global styles
├── public/
│   ├── icons/           # SVG icons
│   └── pdf.worker.min.mjs
├── types/               # TypeScript global types
├── Dockerfile
└── package.json
```

## 📝 How It Works

1. **Sign in** with Puter (free account)
2. **Upload** your resume PDF + enter job details
3. The PDF is converted to an image using PDF.js
4. Both PDF and image are stored in **Puter filesystem**
5. The image is sent to **GPT-4o** via Puter AI with a structured prompt
6. AI returns JSON feedback scored across 5 categories
7. Results are saved in **Puter KV store** and displayed

## 📄 License

MIT
