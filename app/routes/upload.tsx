import { type FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

export function meta() {
  return [
    { title: "Upload Resume | Resumind" },
    { name: "description", content: "Upload your resume for AI analysis" },
  ];
}

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/upload");
  }, [isLoading, auth.isAuthenticated]);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const companyName = (formData.get("companyName") as string) || "";
    const jobTitle = (formData.get("jobTitle") as string) || "";
    const jobDescription = (formData.get("jobDescription") as string) || "";

    if (!file) {
      setStatusText("Please upload a resume PDF first.");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Upload the PDF
      setStatusText("Uploading resume...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        setStatusText("Error: Failed to upload resume.");
        return;
      }

      // Step 2: Convert PDF to image
      setStatusText("Converting to image for AI analysis...");
      const imageResult = await convertPdfToImage(file);
      if (!imageResult.file) {
        setStatusText("Error: Failed to convert PDF to image.");
        return;
      }

      // Step 3: Upload the image
      setStatusText("Uploading resume image...");
      const uploadedImage = await fs.upload([imageResult.file]);
      if (!uploadedImage) {
        setStatusText("Error: Failed to upload image.");
        return;
      }

      // Step 4: AI analysis
      setStatusText("Analyzing resume with AI (this may take a moment)...");
      const prompt = prepareInstructions({ companyName, jobTitle, jobDescription });

      const messages: ChatMessage[] = [
        {
          role: "user",
          content: [
            {
              type: "file",
              puter_path: uploadedImage.path,
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ];

      const aiResponse = await ai.chat(messages);

      // Step 5: Parse JSON response
      setStatusText("Processing AI feedback...");
      let feedback: Feedback;
      try {
        // Extract JSON from the response (handle possible markdown code blocks)
        const jsonMatch =
          aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
          aiResponse.match(/({[\s\S]*})/);
        const jsonStr = jsonMatch ? jsonMatch[1] ?? jsonMatch[0] : aiResponse;
        feedback = JSON.parse(jsonStr.trim());
      } catch {
        setStatusText("Error: Could not parse AI response. Please try again.");
        return;
      }

      // Step 6: Save to KV store
      setStatusText("Saving results...");
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

      // Step 7: Navigate to results
      setStatusText("Done! Redirecting...");
      navigate(`/resume/${id}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setStatusText("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analyze Your Resume
          </h1>
          <p className="mt-2 text-gray-500">
            Fill in the job details and upload your resume to get AI-powered
            feedback.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">
          {/* Job Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Job Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  placeholder="e.g. Google"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="jobTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Job Title
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  required
                  placeholder="e.g. Frontend Engineer"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={5}
                placeholder="Paste the job description here..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Resume (PDF)
            </h2>
            <FileUploader onFileSelect={handleFileSelect} />
          </div>

          {/* Status / Processing */}
          {statusText && (
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                statusText.startsWith("Error")
                  ? "bg-red-50 text-red-700"
                  : "bg-indigo-50 text-indigo-700"
              }`}
            >
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {statusText}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing || !file}
            className="w-full py-3 px-6 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Analyze Resume
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Upload;
