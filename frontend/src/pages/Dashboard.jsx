import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import StatsCard from "../components/StatsCard";
import DocumentCard from "../components/DocumentCard";
import api, { errorMessage } from "../api/api";
import { getUser } from "../utils/auth";
import "../styles/Dashboard.css";

const tips = [
    "Try the Feynman technique: explain a topic out loud as if teaching a friend.",
    "Study in 25-minute sprints with 5-minute breaks — the Pomodoro way.",
    "Test yourself before re-reading. Retrieval beats highlighting.",
    "Space it out: revisit today's topic tomorrow, then in three days.",
    "Mix subjects in one session — interleaving helps long-term memory.",
    "Sleep is revision too. Your brain files the day's notes overnight.",
];

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

function Dashboard() {
    const { username } = getUser();
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({ documents: 0, subjects: 0, categories: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tip] = useState(() => tips[new Date().getDate() % tips.length]);

    useEffect(() => {
        Promise.all([api.get("/documents"), api.get("/dashboard-stats")])
            .then(([docs, st]) => {
                setDocuments(docs.data);
                setStats(st.data);
            })
            .catch((err) => setError(errorMessage(err, "Couldn't load your desk.")))
            .finally(() => setLoading(false));
    }, []);

    const recent = documents.slice(0, 6);

    return (
        <DashboardLayout>
            <section className="welcome">
                <div className="welcome-copy">
                    <span className="hand welcome-hand">{greeting()},</span>
                    <h1>{username} 👋</h1>
                    <p>
                        Your study desk is ready. Upload a new chapter, or pick up
                        a document and start revising.
                    </p>
                    <div className="welcome-actions">
                        <Link to="/upload" className="btn-ink">
                            <i className="bi bi-cloud-arrow-up"></i> Upload a PDF
                        </Link>
                        <Link to="/chat" className="btn-paper">
                            <i className="bi bi-chat-square-quote"></i> Ask the AI tutor
                        </Link>
                    </div>
                </div>

                <aside className="tip-note">
                    <span className="tip-pin" aria-hidden="true" />
                    <span className="hand">Study tip of the day</span>
                    <p>{tip}</p>
                </aside>
            </section>

            {error && (
                <div className="notice notice-error mb-4" role="alert">
                    <i className="bi bi-exclamation-circle"></i> {error}
                </div>
            )}

            <section className="stats-grid">
                <StatsCard title="Documents" value={stats.documents} icon="bi-journals" tone="brown" hint="in your library" />
                <StatsCard title="Subjects" value={stats.subjects} icon="bi-mortarboard" tone="sage" hint="being covered" />
                <StatsCard title="Categories" value={stats.categories} icon="bi-bookmarks" tone="rust" hint="of material" />
                <StatsCard title="Pages" value={stats.pages} icon="bi-file-earmark-text" tone="mustard" hint="read by AI" />
            </section>

            <section className="section-block">
                <div className="section-head">
                    <div>
                        <h2>Recently added</h2>
                        <p>Pick up where you left off.</p>
                    </div>
                    {documents.length > 0 && (
                        <Link to="/documents" className="link-arrow">
                            View library <i className="bi bi-arrow-right"></i>
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="doc-grid">
                        {[1, 2, 3].map((n) => <div key={n} className="doc-card skeleton" />)}
                    </div>
                ) : recent.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-journal-plus"></i>
                        <h3>Your shelf is empty</h3>
                        <p>Upload your first PDF and we'll turn it into notes, flashcards and a quiz.</p>
                        <Link to="/upload" className="btn-ink">Upload a PDF</Link>
                    </div>
                ) : (
                    <div className="doc-grid">
                        {recent.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
                    </div>
                )}
            </section>
        </DashboardLayout>
    );
}

export default Dashboard;
