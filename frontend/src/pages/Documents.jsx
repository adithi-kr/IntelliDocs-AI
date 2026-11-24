import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DocumentCard from "../components/DocumentCard";
import api, { errorMessage } from "../api/api";
import "../styles/Dashboard.css";

function Documents() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [subject, setSubject] = useState("All");
    const [searchParams] = useSearchParams();
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    useEffect(() => {
        api.get("/documents")
            .then((res) => setDocuments(res.data))
            .catch((err) => setError(errorMessage(err, "Couldn't load your library.")))
            .finally(() => setLoading(false));
    }, []);

    const subjects = useMemo(
        () => ["All", ...new Set(documents.map((d) => d.subject || "General"))],
        [documents]
    );

    const visible = documents.filter((d) => {
        if (subject !== "All" && (d.subject || "General") !== subject) return false;
        if (!query) return true;
        return [d.filename, d.subject, d.category, d.tags]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query));
    });

    const handleDelete = async (doc) => {
        if (!window.confirm(`Delete "${doc.filename}"? This can't be undone.`)) return;

        try {
            await api.delete(`/documents/${doc.id}`);
            setDocuments((list) => list.filter((d) => d.id !== doc.id));
        } catch (err) {
            setError(errorMessage(err, "Couldn't delete that document."));
        }
    };

    return (
        <DashboardLayout>
            <div className="page-head">
                <div>
                    <span className="hand page-hand">your bookshelf</span>
                    <h1>My Library</h1>
                    <p>
                        {documents.length} document{documents.length === 1 ? "" : "s"}
                        {query && <> · showing results for “{searchParams.get("q")}”</>}
                    </p>
                </div>
                <Link to="/upload" className="btn-ink">
                    <i className="bi bi-plus-lg"></i> Add document
                </Link>
            </div>

            {error && (
                <div className="notice notice-error mb-4" role="alert">
                    <i className="bi bi-exclamation-circle"></i> {error}
                </div>
            )}

            {subjects.length > 2 && (
                <div className="filter-chips" role="tablist" aria-label="Filter by subject">
                    {subjects.map((s) => (
                        <button
                            key={s}
                            role="tab"
                            aria-selected={subject === s}
                            className={`chip ${subject === s ? "active" : ""}`}
                            onClick={() => setSubject(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="doc-grid">
                    {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="doc-card skeleton" />)}
                </div>
            ) : documents.length === 0 ? (
                <div className="empty-state">
                    <i className="bi bi-bookshelf"></i>
                    <h3>No documents yet</h3>
                    <p>Upload lecture notes or a textbook chapter to start building your library.</p>
                    <Link to="/upload" className="btn-ink">Upload a PDF</Link>
                </div>
            ) : visible.length === 0 ? (
                <div className="empty-state">
                    <i className="bi bi-search"></i>
                    <h3>Nothing matches</h3>
                    <p>Try a different word, or clear the subject filter.</p>
                </div>
            ) : (
                <div className="doc-grid">
                    {visible.map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export default Documents;
