import { useNavigate } from "react-router-dom";

const spineTones = ["#7fbbe6", "#c8ad8d", "#9cc9a5", "#5ba4d6", "#d9bfa0", "#a9cdea"];

export default function DocumentCard({ doc, onDelete }) {
    const navigate = useNavigate();

    const tags = doc.tags
        ? doc.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3)
        : [];

    const summary = doc.summary?.trim();
    const spine = spineTones[doc.id % spineTones.length];
    const open = () => navigate(`/documents/${doc.id}`);

    return (
        <article
            className="doc-card"
            style={{ "--spine": spine }}
            onClick={open}
            onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    open();
                }
            }}
            role="link"
            tabIndex={0}
        >
            <div className="doc-card-top">
                <span className="doc-subject">{doc.subject || "General"}</span>
                {onDelete && (
                    <button
                        className="doc-delete"
                        title="Delete document"
                        aria-label={`Delete ${doc.filename}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc);
                        }}
                    >
                        <i className="bi bi-trash3"></i>
                    </button>
                )}
            </div>

            <h3 className="doc-title" title={doc.filename}>
                {doc.filename.replace(/\.pdf$/i, "")}
            </h3>

            <p className="doc-summary">
                {summary
                    ? summary.length > 140
                        ? `${summary.slice(0, 140).trim()}…`
                        : summary
                    : "No summary yet — open it to view notes and questions."}
            </p>

            <div className="doc-tags">
                {tags.map((tag) => (
                    <span key={tag} className="tag-chip">#{tag}</span>
                ))}
            </div>

            <div className="doc-foot">
                <span><i className="bi bi-bookmark"></i> {doc.category || "Education"}</span>
                <span><i className="bi bi-file-earmark-text"></i> {doc.pages || 0} pages</span>
            </div>
        </article>
    );
}
