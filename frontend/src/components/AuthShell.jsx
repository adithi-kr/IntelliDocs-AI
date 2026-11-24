import Logo from "./Logo";
import "../styles/Auth.css";

const features = [
    { icon: "bi-journal-text", text: "Clean study notes from any PDF" },
    { icon: "bi-mic", text: "Viva flashcards with answers" },
    { icon: "bi-ui-checks", text: "MCQ practice with instant scoring" },
    { icon: "bi-chat-square-quote", text: "An AI tutor that knows your notes" },
];

function AuthShell({ children }) {
    return (
        <div className="auth-page">
            <section className="auth-hero">
                <Logo subtitle="Your AI study desk" light />

                <div className="auth-hero-copy">
                    <span className="hand auth-hand">pssst… exams are coming ✎</span>
                    <h1>
                        Read less.
                        <br />
                        <em>Understand</em> more.
                    </h1>
                    <p>
                        Upload lecture notes, textbooks and question papers.
                        IntelliDocs turns them into revision notes, viva prep
                        and practice quizzes, so you can study smarter.
                    </p>

                    <ul className="auth-features">
                        {features.map((f) => (
                            <li key={f.text}>
                                <i className={`bi ${f.icon}`}></i>
                                {f.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="auth-hero-foot">
                    <i className="bi bi-cup-hot"></i> Grab a coffee. We'll do the highlighting.
                </div>
            </section>

            <section className="auth-panel">
                <div className="auth-card">{children}</div>
            </section>
        </div>
    );
}

export default AuthShell;
