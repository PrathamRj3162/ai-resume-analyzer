import { type FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

export function meta() {
  return [
    { title: "New analysis — resumind" },
    { name: "description", content: "Upload your resume for AI analysis" },
  ];
}

const steps = [
  "Uploading resume...",
  "Converting to image...",
  "Uploading image...",
  "Running AI analysis — this takes a moment...",
  "Parsing feedback...",
  "Saving results...",
];

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [isError, setIsError] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/upload");
  }, [isLoading, auth.isAuthenticated]);

  const handleAnalyze = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const companyName = (formData.get("companyName") as string) || "";
    const jobTitle = (formData.get("jobTitle") as string) || "";
    const jobDescription = (formData.get("jobDescription") as string) || "";

    if (!file) return;

    setIsProcessing(true);
    setIsError(false);

    const fail = (msg: string) => {
      setStatusText(msg);
      setIsError(true);
      setIsProcessing(false);
    };

    try {
      setStatusText(steps[0]);
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) return fail("Couldn't upload the PDF. Try again.");

      setStatusText(steps[1]);
      const imageResult = await convertPdfToImage(file);
      if (!imageResult.file) return fail("Couldn't render the PDF as an image. Is it a valid PDF?");

      setStatusText(steps[2]);
      const uploadedImage = await fs.upload([imageResult.file]);
      if (!uploadedImage) return fail("Couldn't upload the image. Try again.");

      setStatusText(steps[3]);
      const prompt = prepareInstructions({ companyName, jobTitle, jobDescription });
      const messages: ChatMessage[] = [
        {
          role: "user",
          content: [
            { type: "file", puter_path: uploadedImage.path },
            { type: "text", text: prompt },
          ],
        },
      ];
      const aiResponse = await ai.chat(messages);

      setStatusText(steps[4]);
      let feedback: Feedback;
      try {
        const jsonMatch =
          aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
          aiResponse.match(/({[\s\S]*})/);
        const jsonStr = jsonMatch ? jsonMatch[1] ?? jsonMatch[0] : aiResponse;
        feedback = JSON.parse(jsonStr.trim());
      } catch {
        return fail("The AI returned something unexpected. Try again.");
      }

      setStatusText(steps[5]);
      const id = generateUUID();
      const resumeData: Resume = {
        id,
        companyName,
        jobTitle,
        imagePath: uploadedImage.path,
        resumePath: uploadedFile.path,
        feedback,
      };
      await kv.set(`resume:${id}`, JSON.stringify(resumeData));

      navigate(`/resume/${id}`);
    } catch {
      fail("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <Navbar />

      <main className="max-w-2xl mx-auto px-5 py-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 mb-8 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mb-1">
          New resume analysis
        </h1>
        <p className="text-stone-400 text-sm mb-8">
          Fill in the details below and let the AI do its thing.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-5">
          {/* Job info section */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">
              The role you're applying for
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="companyName">
                  Company
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  placeholder="Google"
                  className="field-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="jobTitle">
                  Job title
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  required
                  placeholder="Frontend Engineer"
                  className="field-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="jobDescription">
                Job description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={6}
                placeholder="Paste the full job description here — the more detail, the better the feedback."
                className="field-input resize-none"
              />
            </div>
          </div>

          {/* Upload section */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">
              Your resume
            </p>
            <FileUploader onFileSelect={setFile} />
          </div>

          {/* Status message */}
          {statusText && (
            <div
              className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2.5 fade-up ${
                isError
                  ? "bg-red-50 border border-red-100 text-red-700"
                  : "bg-amber-50 border border-amber-100 text-amber-800"
              }`}
            >
              {isProcessing && !isError && (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {isError && <span className="shrink-0">⚠</span>}
              {statusText}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing || !file}
            className="btn-primary w-full py-3 text-sm"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze this resume →"
            )}
          </button>

          <p className="text-center text-xs text-stone-400">
            Your resume is stored privately in your Puter account. We never see it.
          </p>
        </form>
      </main>
    </div>
  );
};

export default Upload;
