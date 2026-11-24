import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api, { errorMessage } from "../api/api";
import FormattedText from "../components/FormattedText";
import { getUser, initials } from "../utils/auth";
import "../styles/Chat.css";

const suggestions = [
    { icon: "bi-stars", text: "Summarize this document in simple words" },
    { icon: "bi-list-check", text: "What are the most important topics for my exam?" },
    { icon: "bi-question-circle", text: "Give me 5 likely exam questions with answers" },
    { icon: "bi-lightbulb", text: "Explain the hardest concept with an example" },
];

function Chat() {
    const { username } = getUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedDocument = searchParams.get("document") || "";

    const [documents, setDocuments] = useState([]);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const endRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        api.get("/documents")
            .then((res) => setDocuments(res.data))
            .catch((err) => setLoadError(errorMessage(err, "Couldn't load your documents.")));
    }, []);

    // Fresh conversation whenever the document changes
    useEffect(() => setMessages([]), [selectedDocument]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, loading]);

    const selectDocument = (value) => {
        setSearchParams(value ? { document: value } : {}, { replace: true });
    };

    const askQuestion = async (text = question) => {
        const userQuestion = text.trim();
        if (!selectedDocument || !userQuestion || loading) return;

        const history = messages;
        const next = [...history, { role: "user", content: userQuestion }];

        setMessages(next);
        setQuestion("");
        setLoading(true);

        try {
            const res = await api.post(`/documents/${selectedDocument}/chat`, {
                question: userQuestion,
                history,
            });
            setMessages([...next, { role: "ai", content: res.data.answer }]);
        } catch (err) {
            setMessages([
                ...next,
                { role: "ai", content: errorMessage(err, "Sorry, I couldn't answer that right now. Please try again."), error: true },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            askQuestion();
        }
    };

    const currentDoc = documents.find((d) => String(d.id) === selectedDocument);

    return (
        <DashboardLayout>
            <div className="chat-page">
                <div className="page-head">
                    <div>
                        <span className="hand page-hand">stuck on something?</span>
                        <h1>Ask the AI Tutor</h1>
                        <p>Ask questions about any document in your library.</p>
                    </div>
                    {messages.length > 0 && (
                        <button className="btn-paper" onClick={() => setMessages([])}>
                            <i className="bi bi-eraser"></i> New chat
                        </button>
                    )}
                </div>

                <div className="chat-doc-picker">
                    <i className="bi bi-journal-bookmark"></i>
                    <select
                        value={selectedDocument}
                        onChange={(e) => selectDocument(e.target.value)}
                        aria-label="Choose a document"
                    >
                        <option value="">Choose a document to study…</option>
                        {documents.map((doc) => (
                            <option key={doc.id} value={doc.id}>{doc.filename}</option>
                        ))}
                    </select>
                    {currentDoc && (
                        <Link to={`/documents/${currentDoc.id}`} className="link-arrow">
                            Open notes <i className="bi bi-arrow-up-right"></i>
                        </Link>
                    )}
                </div>

                {loadError && (
                    <div className="notice notice-error" role="alert">
                        <i className="bi bi-exclamation-circle"></i> {loadError}
                    </div>
                )}

                <section className="chat-box">
                    <div className="chat-messages" aria-live="polite">
                        {messages.length === 0 ? (
                            <div className="chat-empty">
                                <div className="chat-empty-icon"><i className="bi bi-mortarboard"></i></div>
                                {documents.length === 0 && !loadError ? (
                                    <>
                                        <h3>No documents yet</h3>
                                        <p>Upload a PDF first, then come back to ask questions about it.</p>
                                        <Link to="/upload" className="btn-ink">Upload a PDF</Link>
                                    </>
                                ) : (
                                    <>
                                        <h3>{selectedDocument ? "What would you like to learn?" : "Pick a document to begin"}</h3>
                                        <p>
                                            {selectedDocument
                                                ? "Try one of these, or type your own question below."
                                                : "Your tutor answers using the document you choose above."}
                                        </p>
                                        {selectedDocument && (
                                            <div className="suggestions">
                                                {suggestions.map((s) => (
                                                    <button key={s.text} onClick={() => askQuestion(s.text)}>
                                                        <i className={`bi ${s.icon}`}></i> {s.text}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`message ${m.role === "user" ? "from-user" : "from-ai"} ${m.error ? "is-error" : ""}`}>
                                    <div className="message-avatar">
                                        {m.role === "user" ? initials(username) : <i className="bi bi-mortarboard-fill"></i>}
                                    </div>
                                    <div className="message-bubble">
                                        <span className="message-who">{m.role === "user" ? "You" : "AI Tutor"}</span>
                                        {m.role === "user" ? <p>{m.content}</p> : <FormattedText text={m.content} />}
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="message from-ai">
                                <div className="message-avatar"><i className="bi bi-mortarboard-fill"></i></div>
                                <div className="message-bubble">
                                    <span className="message-who">AI Tutor</span>
                                    <div className="typing"><span /><span /><span /></div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    <form
                        className="chat-input"
                        onSubmit={(e) => {
                            e.preventDefault();
                            askQuestion();
                        }}
                    >
                        <textarea
                            ref={inputRef}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedDocument ? "Ask anything about this document…" : "Choose a document first…"}
                            disabled={!selectedDocument}
                            rows={1}
                            aria-label="Your question"
                        />
                        <button
                            type="submit"
                            className="send-btn"
                            disabled={!selectedDocument || !question.trim() || loading}
                            aria-label="Send"
                        >
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </form>
                    <small className="chat-hint">Enter to send · Shift + Enter for a new line</small>
                </section>
            </div>
        </DashboardLayout>
    );
}

export default Chat;
