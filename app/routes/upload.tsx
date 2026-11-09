import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { prepareInstructions } from '~/constants';
import { extractPdfText, loadPdf, preloadPdfWorker, renderFirstPageToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { parseFeedback } from "~/lib/parseFeedback";
import { computeKeywordMatch } from "~/lib/keywordMatch";

const AI_TIMEOUT_MS = 60_000;

const withTimeout = <T,>(p: Promise<T>, ms: number, msg: string) =>
    Promise.race([
        p,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
    ]);

const cleanText = (text: string, maxLen = 4500) =>
    text
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim()
        .slice(0, maxLen);

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        preloadPdfWorker();
    }, []);

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    }

    const handleAnalyze = async ({
        companyName,
        jobTitle,
        jobDescription,
        file: resumeFile
    }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);
        setError(null);
        try {
            // 1. Fast local PDF text extraction & validation (<50ms)
            setStatusText('Reading your resume...');
            const pdf = await loadPdf(resumeFile);
            const rawResumeText = await extractPdfText(pdf);
            if (rawResumeText.length < 200) {
                throw new Error('No readable text found in this PDF. It looks scanned/image-only, which ATS systems cannot parse. Export a text-based PDF and retry.');
            }

            const resumeText = cleanText(rawResumeText, 4500);
            const cleanedJD = cleanText(jobDescription, 1500);

            // 2. Deterministic keyword match computed locally in <1ms
            const keywordMatch = computeKeywordMatch(cleanedJD, resumeText);

            setStatusText('Analyzing resume...');

            // 3. Render preview image in parallel with model evaluation
            const imageRenderPromise = renderFirstPageToImage(pdf, resumeFile.name);

            const aiPromise = withTimeout(
                ai.chat(
                    prepareInstructions({ companyName, jobTitle, jobDescription: cleanedJD }) +
                    `\n\nRESUME TEXT:\n${resumeText}`
                ),
                AI_TIMEOUT_MS,
                'Analysis timed out. Please try again.'
            );

            // Await model feedback & image render concurrently
            const [imageFile, rawFeedback] = await Promise.all([imageRenderPromise, aiPromise]);
            if (!rawFeedback) throw new Error('Analysis engine returned an empty response.');
            const feedback = parseFeedback(rawFeedback);

            const uuid = generateUUID();
            const localImageUrl = imageFile ? URL.createObjectURL(imageFile) : '';
            const localResumeUrl = URL.createObjectURL(resumeFile);

            // 4. Navigate immediately with in-memory state (0ms cloud latency for the user!)
            navigate(`/resume/${uuid}`, {
                state: {
                    id: uuid,
                    feedback,
                    keywordMatch: keywordMatch ?? undefined,
                    imageUrl: localImageUrl,
                    resumeUrl: localResumeUrl,
                    companyName,
                    jobTitle,
                    jobDescription: cleanedJD,
                }
            });

            // 5. Non-blocking background sync to Puter FS & KV
            void (async () => {
                try {
                    const uploadOps: Promise<any>[] = [fs.upload([resumeFile])];
                    if (imageFile) uploadOps.push(fs.upload([imageFile]));
                    const [uploadedPdf, uploadedImg] = await Promise.all(uploadOps);

                    await kv.set(`resume:${uuid}`, JSON.stringify({
                        id: uuid,
                        resumePath: uploadedPdf?.path,
                        imagePath: uploadedImg?.path,
                        companyName,
                        jobTitle,
                        jobDescription: cleanedJD,
                        feedback,
                        keywordMatch: keywordMatch ?? undefined,
                    }));
                } catch (syncErr) {
                    console.warn('Background sync to Puter completed with warning:', syncErr);
                }
            })();

        } catch (e) {
            console.error('Analyze failed:', e);
            setError(e instanceof Error ? e.message : 'Something went wrong.');
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className='page-heading py-16'>
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" alt="Scanning animation" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {error && !isProcessing && (
                        <p className="text-red-600 mt-4 max-w-xl mx-auto">{error}</p>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                            <div className='form-div'>
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name='company-name' placeholder='Company Name' id='company-name' />
                            </div>
                            <div className='form-div'>
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name='job-title' placeholder='Job Title' id='job-title' />
                            </div>
                            <div className='form-div'>
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name='job-description' placeholder='Job Description' id='job-description' />
                            </div>
                            <div className='form-div'>
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />

                                <button className='primary-button' type='submit'>
                                    Analyze Resume
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload;
