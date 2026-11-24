import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchMe } from "../api/auth";
import { clearSession, getUser, initials } from "../utils/auth";
import { applyTheme, getTheme } from "../utils/theme";
import "../styles/Dashboard.css";

function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUser());
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        fetchMe()
            .then((res) => {
                setUser(res.data);
                localStorage.setItem("username", res.data.username);
                localStorage.setItem("email", res.data.email);
            })
            .catch(() => { /* keep cached values */ });
    }, []);

    const chooseTheme = (t) => {
        applyTheme(t);
        setTheme(t);
    };

    const logout = () => {
        clearSession();
        navigate("/", { replace: true });
    };

    return (
        <DashboardLayout>
            <div className="page-head">
                <div>
                    <span className="hand page-hand">make it yours</span>
                    <h1>Settings</h1>
                    <p>Your profile and how your study desk looks.</p>
                </div>
            </div>

            <div className="settings-grid">
                <section className="panel-card">
                    <h2><i className="bi bi-person-badge"></i> Student ID card</h2>
                    <div className="id-card">
                        <div className="avatar avatar-lg">{initials(user.username)}</div>
                        <div>
                            <strong>{user.username}</strong>
                            <span>{user.email || "—"}</span>
                            <small>IntelliDocs Student</small>
                        </div>
                    </div>
                </section>

                <section className="panel-card">
                    <h2><i className="bi bi-palette"></i> Appearance</h2>
                    <p className="panel-sub">Pick the light that suits your study session.</p>
                    <div className="theme-options">
                        <button className={`theme-option ${theme === "light" ? "active" : ""}`} onClick={() => chooseTheme("light")}>
                            <span className="swatch swatch-light" />
                            <strong>Library day</strong>
                            <small>Warm paper &amp; ink</small>
                        </button>
                        <button className={`theme-option ${theme === "dark" ? "active" : ""}`} onClick={() => chooseTheme("dark")}>
                            <span className="swatch swatch-dark" />
                            <strong>Night study</strong>
                            <small>Cosy espresso tones</small>
                        </button>
                    </div>
                </section>

                <section className="panel-card">
                    <h2><i className="bi bi-door-open"></i> Session</h2>
                    <p className="panel-sub">Log out of IntelliDocs on this device.</p>
                    <button className="btn-danger-soft" onClick={logout}>
                        <i className="bi bi-box-arrow-right"></i> Log out
                    </button>
                </section>
            </div>
        </DashboardLayout>
    );
}

export default Settings;
