import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout";
import FormattedText, { Inline } from "../components/FormattedText";
import { parseMCQs, parseViva } from "../utils/parsers";
import "../styles/DocumentDetails.css";

const tabs = [
    { id: "summary", icon: "bi-stars", title: "Summary" },
    { id: "notes", icon: "bi-journal-text", title: "Study Notes" },
    { id: "keypoints", icon: "bi-key", title: "Key Points" },
    { id: "viva", icon: "bi-mic", title: "Viva Cards" },
    { id: "mcqs", icon: "bi-ui-checks", title: "MCQ Quiz" },
];

function VivaCards({ text }) {
    const cards = useMemo(() => parseViva(text), [text]);
    const [open, setOpen] = useState({});

    if (!cards.length) return <FormattedText text={text} emptyText="No viva questions available." />;

    const allOpen = cards.every((_, i) => open[i]);

    return (
        <>
            <div className="panel-toolbar">
                <span>{cards.length} flashcards · tap a card to reveal the answer</span>
                <button
                    className="btn-paper btn-sm"
                    onClick={() => setOpen(allOpen ? {} : Object.fromEntries(cards.map((_, i) => [i, true])))}
                >
                    {allOpen ? "Hide all answers" : "Show all answers"}
                </button>
            </div>

            <div className="viva-grid">
                {cards.map((card, i) => (
                    <button
                        key={i}
                        className={`viva-card ${open[i] ? "revealed" : ""}`}
                        onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                        aria-expanded={!!open[i]}
                    >
                        <span className="viva-num">Q{i + 1}</span>
                        <p className="viva-q"><Inline text={card.q} /></p>
                        {open[i] ? (
                            <div className="viva-a">
                                <span className="hand">answer</span>
                                <p>{card.a ? <Inline text={card.a} /> : "No answer was provided."}</p>
                            </div>
                        ) : (
                            <span className="viva-hint"><i className="bi bi-eye"></i> Reveal answer</span>
                        )}
                    </button>
                ))}
            </div>
        </>
    );
}

function McqQuiz({ text }) {
    const questions = useMemo(() => parseMCQs(text), [text]);
    const [picked, setPicked] = useState({});
    const [revealed, setRevealed] = useState({});

    if (!questions.length) return <FormattedText text={text} emptyText="No MCQs available." />;

    const gradable = questions.filter((q) => q.letter);
    const answered = gradable.filter((q) => picked[questions.indexOf(q)]);
    const score = answered.filter((q) => picked[questions.indexOf(q)] === q.letter).length;

    return (
        <>
            <div className="panel-toolbar">
                <span>
                    {gradable.length > 0
                        ? <>Score: <strong>{score}</strong> / {answered.length} answered · {gradable.length} questions</>
                        : `${questions.length} questions`}
                </span>
                <button className="btn-paper btn-sm" onClick={() => { setPicked({}); setRevealed({}); }}>
                    <i className="bi bi-arrow-counterclockwise"></i> Reset quiz
                </button>
            </div>

            <div className="mcq-list">
                {questions.map((q, i) => {
                    const choice = picked[i];
                    const show = revealed[i] || (choice && q.letter);

                    return (
                        <div className="mcq-card" key={i}>
                            <div className="mcq-head">
                                <span className="mcq-num">{i + 1}</span>
                                <p className="mcq-question"><Inline text={q.question} /></p>
                            </div>

                            {q.options.length > 0 && (
                                <div className="mcq-options">
                                    {q.options.map((opt) => {
                                        let state = "";
                                        if (show && q.letter === opt.letter) state = "correct";
                                        else if (choice === opt.letter && q.letter) state = "wrong";
                                        else if (choice === opt.letter) state = "chosen";

                                        return (
                                            <button
                                                key={opt.letter}
                                                className={`mcq-option ${state}`}
                                                disabled={!!choice && !!q.letter}
                                                onClick={() => setPicked((p) => ({ ...p, [i]: opt.letter }))}
                                            >
                                                <span className="opt-letter">{opt.letter}</span>
                                                <span><Inline text={opt.text} /></span>
                                                {state === "correct" && <i className="bi bi-check-circle-fill"></i>}
                                                {state === "wrong" && <i className="bi bi-x-circle-fill"></i>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {q.answer && (show ? (
                                <div className="mcq-answer">
                                    <strong>Answer:</strong> {q.answer}
                                    {q.explanation && <p>{q.explanation}</p>}
                                </div>
                            ) : (
                                <button className="link-btn" onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}>
                                    <i className="bi bi-eye"></i> Show answer
                                </button>
                            ))}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function DocumentDetails() {
    const { id } = useParams();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const hashTab = location.hash.slice(1);
    const active = tabs.some((t) => t.id === hashTab) ? hashTab : "summary";
    const setActive = (tabId) => navigate({ hash: tabId }, { replace: true });
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError("");
        api.get(`/documents/${id}`)
            .then((res) => setDoc(res.data))
            .catch((err) => setError(errorMessage(err, "Couldn't load this document.")))
            .finally(() => setLoading(false));
    }, [id]);

    const downloadNotes = async () => {
        setDownloading(true);
        try {
            const res = await api.get(`/documents/${doc.id}/download-notes`, { responseType: "blob" });
            const url = URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${doc.filename.replace(/\.pdf$/i, "")}_notes.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(errorMessage(err, "Couldn't create the PDF."));
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="detail-loading">
                    <div className="book-loader" aria-hidden="true"><span /><span /><span /></div>
                    <p>Opening your notes…</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!doc) {
        return (
            <DashboardLayout>
                <div className="empty-state">
                    <i className="bi bi-journal-x"></i>
                    <h3>Document not found</h3>
                    <p>{error || "It may have been deleted."}</p>
                    <Link to="/documents" className="btn-ink">Back to library</Link>
                </div>
            </DashboardLayout>
        );
    }

    const tags = (doc.tags || "").split(",").map((t) => t.trim()).filter(Boolean);

    const content = {
        summary: <FormattedText text={doc.summary} emptyText="No summary was generated." />,
        notes: <FormattedText text={doc.notes} emptyText="No notes were generated." />,
        keypoints: <FormattedText text={doc.key_points} emptyText="No key points were generated." />,
        viva: <VivaCards text={doc.viva_questions} />,
        mcqs: <McqQuiz text={doc.mcqs} />,
    };

    return (
        <DashboardLayout>
            <Link to="/documents" className="back-link">
                <i className="bi bi-arrow-left"></i> Back to library
            </Link>

            <header className="detail-hero">
                <div className="detail-hero-main">
                    <span className="doc-subject">{doc.subject || "General"}</span>
                    <h1>{doc.filename.replace(/\.pdf$/i, "")}</h1>
                    <div className="detail-meta">
                        <span><i className="bi bi-bookmark"></i> {doc.category}</span>
                        <span><i className="bi bi-file-earmark-text"></i> {doc.pages} pages</span>
                    </div>
                    {tags.length > 0 && (
                        <div className="doc-tags">
                            {tags.map((t) => <span key={t} className="tag-chip">#{t}</span>)}
                        </div>
                    )}
                </div>

                <div className="detail-actions">
                    <Link to={`/chat?document=${doc.id}`} className="btn-ink">
                        <i className="bi bi-chat-square-quote"></i> Ask AI about this
                    </Link>
                    <button className="btn-paper" onClick={downloadNotes} disabled={downloading}>
                        {downloading ? <><span className="spinner" /> Preparing…</> : <><i className="bi bi-download"></i> Download notes PDF</>}
                    </button>
                </div>
            </header>

            {error && (
                <div className="notice notice-error mb-3" role="alert">
                    <i className="bi bi-exclamation-circle"></i> {error}
                </div>
            )}

            <nav className="notebook-tabs" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={active === tab.id}
                        className={active === tab.id ? "active" : ""}
                        onClick={() => setActive(tab.id)}
                    >
                        <i className={`bi ${tab.icon}`}></i>
                        <span>{tab.title}</span>
                    </button>
                ))}
            </nav>

            <section className="notebook-page" role="tabpanel">
                {content[active]}
            </section>
        </DashboardLayout>
    );
}

export default DocumentDetails;
