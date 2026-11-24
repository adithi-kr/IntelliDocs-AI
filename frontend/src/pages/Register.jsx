import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { errorMessage } from "../api/api";
import AuthShell from "../components/AuthShell";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const email = form.email.trim();
            await registerUser({ ...form, username: form.username.trim(), email });
            navigate("/", { state: { registered: true, email } });
        } catch (err) {
            setError(errorMessage(err, "Registration failed. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell>
            <span className="auth-eyebrow">New semester, new desk</span>
            <h2>Create your account</h2>
            <p className="auth-sub">It takes less than a minute.</p>

            {error && (
                <div className="notice notice-error" role="alert">
                    <i className="bi bi-exclamation-circle"></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <label className="field">
                    <span>Name</span>
                    <div className="field-input">
                        <i className="bi bi-person"></i>
                        <input
                            type="text"
                            name="username"
                            placeholder="What should we call you?"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="name"
                            minLength={2}
                            required
                        />
                    </div>
                </label>

                <label className="field">
                    <span>Email</span>
                    <div className="field-input">
                        <i className="bi bi-envelope"></i>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@college.edu"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>
                </label>

                <label className="field">
                    <span>Password</span>
                    <div className="field-input">
                        <i className="bi bi-lock"></i>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="At least 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            className="field-toggle"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>
                </label>

                <button type="submit" className="btn-ink w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner" /> Creating…
                        </>
                    ) : (
                        <>
                            Create account <i className="bi bi-arrow-right"></i>
                        </>
                    )}
                </button>
            </form>

            <p className="auth-switch">
                Already have an account? <Link to="/">Log in</Link>
            </p>
        </AuthShell>
    );
}

export default Register;
