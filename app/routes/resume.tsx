import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import ATS from "~/components/ATS";
import KeywordMatch from "~/components/KeywordMatch";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
    { title: 'Resumind | Review' },
    { name: 'description', content: 'Detailed review of your resume' },
]);

interface RouteState {
    id?: string;
    feedback?: Feedback;
    keywordMatch?: KeywordMatchResult;
    imageUrl?: string;
    resumeUrl?: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
}

const ResumeReview = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Check if state was passed in-memory from /upload (Instant 0ms load!)
    const navState = (location.state as RouteState) || null;

    const [imageUrl, setImageUrl] = useState<string>(navState?.imageUrl || '');
    const [resumeUrl, setResumeUrl] = useState<string>(navState?.resumeUrl || '');
    const [feedback, setFeedback] = useState<Feedback | null>(navState?.feedback || null);
    const [keywordMatch, setKeywordMatch] = useState<KeywordMatchResult | null>(navState?.keywordMatch || null);
    const [isFetchingFromCloud, setIsFetchingFromCloud] = useState(!navState?.feedback);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [isLoading, auth.isAuthenticated, id, navigate]);

    useEffect(() => {
        // If data was already populated via in-memory state hand-off, skip KV fetching
        if (feedback && (imageUrl || resumeUrl)) {
            setIsFetchingFromCloud(false);
            return;
        }

        const loadResumeFromCloud = async () => {
            try {
                const record = await kv.get(`resume:${id}`);
                if (!record) {
                    setIsFetchingFromCloud(false);
                    return;
                }

                const data = JSON.parse(record);
                setFeedback(data.feedback);
                setKeywordMatch(data.keywordMatch ?? null);

                // Fetch previews in parallel
                const [resumeBlob, imageBlob] = await Promise.all([
                    data.resumePath ? fs.read(data.resumePath) : Promise.resolve(null),
                    data.imagePath ? fs.read(data.imagePath) : Promise.resolve(null),
                ]);

                if (resumeBlob) setResumeUrl(URL.createObjectURL(new Blob([resumeBlob], { type: 'application/pdf' })));
                if (imageBlob) setImageUrl(URL.createObjectURL(imageBlob));
            } catch (err) {
                console.error("Failed to load resume record from Puter KV:", err);
            } finally {
                setIsFetchingFromCloud(false);
            }
        };

        loadResumeFromCloud();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="Back icon" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && (
                        <div className="animate-in fade-in duration-700 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl || '#'} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    alt="Resume preview"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                            <KeywordMatch result={keywordMatch} />
                            <Details feedback={feedback} />
                        </div>
                    ) : isFetchingFromCloud ? (
                        <div className="flex flex-col items-center justify-center p-12">
                            <img src="/images/resume-scan-2.gif" className="w-full max-w-md" alt="Loading resume..." />
                            <p className="text-gray-600 mt-4 font-medium">Retrieving review from cloud storage...</p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-red-600 font-semibold text-lg">Resume review not found.</p>
                            <Link to="/upload" className="primary-button inline-block mt-4">
                                Analyze a Resume
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default ResumeReview;
