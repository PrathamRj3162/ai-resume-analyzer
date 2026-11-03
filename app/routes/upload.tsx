import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { prepareInstructions } from '~/constants';
import { extractPdfText, loadPdf, renderFirstPageToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { parseFeedback } from "~/lib/parseFeedback";
import { computeKeywordMatch } from "~/lib/keywordMatch";

const AI_TIMEOUT_MS = 90_000;

const withTimeout = <T,>(p: Promise<T>, ms: number, msg: string) =>
    Promise.race([
        p,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
    ]);


const Upload = () => {
    const {fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [file , setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyze = async ({companyName, jobTitle, jobDescription, file} : {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        setIsProcessing(true);
        setError(null);
        try {
            setStatusText('Reading your resume...');
            const pdf = await loadPdf(file);
            const resumeText = await extractPdfText(pdf);
            if (resumeText.length < 200) {
                throw new Error('No readable text found in this PDF. It looks scanned/image-only, which ATS systems also cannot read. Export a text-based PDF and retry.');
            }
            const keywordMatch = computeKeywordMatch(jobDescription, resumeText);

            setStatusText('Analyzing resume...');

            // AI call and file storage run IN PARALLEL. The AI no longer waits on 3 upload round-trips.
            const storagePromise = (async () => {
                const [uploadedFile, imageFile] = await Promise.all([
                    fs.upload([file]),
                    renderFirstPageToImage(pdf, file.name),
                ]);
                if (!uploadedFile) throw new Error('Failed to upload resume.');
                if (!imageFile) throw new Error('Failed to render resume preview.');
                const uploadedImage = await fs.upload([imageFile]);
                if (!uploadedImage) throw new Error('Failed to upload preview image.');
                return { resumePath: uploadedFile.path, imagePath: uploadedImage.path };
            })();

            const aiPromise = withTimeout(
                ai.chat(
                    prepareInstructions({ companyName, jobTitle, jobDescription }) +
                    `\n\nRESUME TEXT:\n${resumeText}`
                ),
                AI_TIMEOUT_MS,
                'Analysis timed out. Please try again.'
            );

            const [paths, rawFeedback] = await Promise.all([storagePromise, aiPromise]);
            if (!rawFeedback) throw new Error('AI returned an empty response.');
            const feedback = parseFeedback(rawFeedback);

            setStatusText('Saving...');
            const uuid = generateUUID();
            const saved = await kv.set(`resume:${uuid}`, JSON.stringify({
                id: uuid,
                ...paths,
                companyName, jobTitle, jobDescription,
                feedback,
                keywordMatch: keywordMatch ?? undefined,
            }));
            if (!saved) throw new Error('Failed to save results.');

            navigate(`/resume/${uuid}`);
        } catch (e) {
            console.error('Analyze failed:', e);
            setError(e instanceof Error ? e.message : 'Something went wrong.');
            setIsProcessing(false); // <- the old code never reset this, so the UI hung forever on any error
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({companyName, jobTitle, jobDescription, file});
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
                        <img src="/images/resume-scan.gif"  className="w-full" />
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
                            <input type="text" name='company-name' placeholder='Company Name' id='company-name'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name='job-title' placeholder='Job Title' id='job-title'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-description">Job Description</label>
                            <textarea rows={5} name='job-description' placeholder='Job Description' id='job-description'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="uploader">Upload Resume</label>
                            <FileUploader onFileSelect={handleFileSelect}/>

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

export default Upload
