import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api, { errorMessage } from "../api/api";
import "../styles/Upload.css";

const MAX_MB = 25;

const steps = [
    { icon: "bi-file-earmark-text", text: "Reading your pages…" },
    { icon: "bi-highlighter", text: "Highlighting the important bits…" },
    { icon: "bi-journal-text", text: "Writing study notes…" },
    { icon: "bi-mic", text: "Preparing viva questions…" },
    { icon: "bi-ui-checks", text: "Setting a practice quiz…" },
];

const prettySize = (bytes) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

function Upload() {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | uploading | done | error
    const [step, setStep] = useState(0);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (status !== "uploading") return undefined;
        setStep(0);
        const timer = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 4000);
        return () => clearInterval(timer);
    }, [status]);

    const pickFile = (picked) => {
        setError("");
        setResult(null);
        setStatus("idle");

        if (!picked) return;

        if (!picked.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are supported.");
            return;
        }
        if (picked.size > MAX_MB * 1024 * 1024) {
            setError(`That file is over ${MAX_MB} MB. Try a smaller PDF.`);
            return;
        }
        setFile(picked);
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError("");
        setStatus("idle");
        if (inputRef.current) inputRef.current.value = "";
    };

    const uploadFile = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setStatus("uploading");
        setError("");

        try {
            const res = await api.post("/upload", formData);
            setResult(res.data);
            setStatus("done");
        } catch (err) {
            setError(errorMessage(err, "Upload failed. Please try again."));
            setStatus("error");
        }
    };

    const uploading = status === "uploading";

    return (
        <DashboardLayout>
            <div className="page-head">
                <div>
                    <span className="hand page-hand">new chapter?</span>
                    <h1>Upload Notes</h1>
                    <p>Drop in a PDF and get notes, key points, viva questions and MCQs.</p>
                </div>
            </div>

            <div className="upload-layout">
                <section className="upload-card">
                    {status === "done" && result ? (
                        <div className="upload-success">
                            <div className="success-stamp"><i className="bi bi-check2"></i></div>
                            <h2>Your study pack is ready!</h2>
                            <p>
                                <strong>{result.document.filename}</strong> · {result.document.pages} pages ·{" "}
                                {result.document.subject}
                            </p>

                            {result.ai_status === "offline" && (
                                <div className="notice notice-warn">
                                    <i className="bi bi-exclamation-triangle"></i>
                                    The AI didn't respond, so some sections may be empty. You can still chat with the document later.
                                </div>
                            )}

                            <div className="upload-actions">
                                <Link to={`/documents/${result.document.id}`} className="btn-ink">
                                    <i className="bi bi-journal-text"></i> Open study pack
                                </Link>
                                <button className="btn-paper" onClick={reset}>
                                    <i className="bi bi-plus-lg"></i> Upload another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (!uploading) setDragging(true);
                                }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragging(false);
                                    if (!uploading) pickFile(e.dataTransfer.files?.[0]);
                                }}
                                onClick={() => !uploading && inputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === "Enter" || e.key === " ") && !uploading) {
                                        e.preventDefault();
                                        inputRef.current?.click();
                                    }
                                }}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    hidden
                                    onChange={(e) => pickFile(e.target.files?.[0])}
                                />

                                {uploading ? (
                                    <div className="upload-progress" aria-live="polite">
                                        <div className="book-loader" aria-hidden="true">
                                            <span /><span /><span />
                                        </div>
                                        <h3>
                                            <i className={`bi ${steps[step].icon}`}></i> {steps[step].text}
                                        </h3>
                                        <p>This usually takes 30–90 seconds. Keep this tab open.</p>
                                        <div className="step-dots">
                                            {steps.map((s, i) => (
                                                <span key={s.text} className={i <= step ? "on" : ""} />
                                            ))}
                                        </div>
                                    </div>
                                ) : file ? (
                                    <div className="file-preview">
                                        <div className="file-icon"><i className="bi bi-file-earmark-pdf"></i></div>
                                        <div>
                                            <strong>{file.name}</strong>
                                            <small>{prettySize(file.size)} · click to choose a different file</small>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="drop-icon"><i className="bi bi-cloud-arrow-up"></i></div>
                                        <h3>Drag & drop your PDF here</h3>
                                        <p>or <span className="link-like">browse your files</span> · up to {MAX_MB} MB</p>
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="notice notice-error" role="alert">
                                    <i className="bi bi-exclamation-circle"></i> {error}
                                </div>
                            )}

                            <div className="upload-actions">
                                <button className="btn-ink" onClick={uploadFile} disabled={!file || uploading}>
                                    {uploading ? (
                                        <><span className="spinner" /> Working on it…</>
                                    ) : (
                                        <><i className="bi bi-stars"></i> Create study pack</>
                                    )}
                                </button>
                                {file && !uploading && (
                                    <button className="btn-paper" onClick={reset}>Clear</button>
                                )}
                            </div>
                        </>
                    )}
                </section>

                <aside className="upload-side">
                    <h3 className="hand">What you'll get</h3>
                    <ul>
                        <li><i className="bi bi-stars"></i><div><strong>Summary</strong><span>The whole document in a few paragraphs</span></div></li>
                        <li><i className="bi bi-journal-text"></i><div><strong>Study notes</strong><span>Definitions, examples and formulas</span></div></li>
                        <li><i className="bi bi-key"></i><div><strong>Key points</strong><span>Ten things to revise the night before</span></div></li>
                        <li><i className="bi bi-mic"></i><div><strong>Viva flashcards</strong><span>Questions with tap-to-reveal answers</span></div></li>
                        <li><i className="bi bi-ui-checks"></i><div><strong>MCQ quiz</strong><span>Practice with instant scoring</span></div></li>
                    </ul>
                    <p className="upload-tip">
                        <i className="bi bi-lightbulb"></i> Text-based PDFs work best. Scanned photos of pages can't be read yet.
                    </p>
                </aside>
            </div>
        </DashboardLayout>
    );
}

export default Upload;
