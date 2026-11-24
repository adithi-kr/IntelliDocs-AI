import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { errorMessage } from "../api/api";
import { saveSession } from "../utils/auth";
import AuthShell from "../components/AuthShell";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const justRegistered = location.state?.registered;

    const [form, setForm] = useState({
        email: location.state?.email || "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await loginUser({ ...form, email: form.email.trim() });
            saveSession({ ...res.data, email: res.data.email || form.email.trim() });
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(errorMessage(err, "Invalid email or password."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell>
            <span className="auth-eyebrow">Welcome back</span>
            <h2>Open your study desk</h2>
            <p className="auth-sub">Log in to pick up where you left off.</p>

            {justRegistered && !error && (
                <div className="notice notice-success" role="status">
                    <i className="bi bi-check2-circle"></i>
                    Account created! Log in to get started.
                </div>
            )}

            {error && (
                <div className="notice notice-error" role="alert">
                    <i className="bi bi-exclamation-circle"></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
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
                            placeholder="Your password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
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
                            <span className="spinner" /> Opening…
                        </>
                    ) : (
                        <>
                            Log in <i className="bi bi-arrow-right"></i>
                        </>
                    )}
                </button>
            </form>

            <p className="auth-switch">
                New here? <Link to="/register">Create a free account</Link>
            </p>
        </AuthShell>
    );
}

export default Login;
