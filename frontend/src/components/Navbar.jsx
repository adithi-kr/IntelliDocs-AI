import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getTheme, toggleTheme } from "../utils/theme";
import { getUser, initials } from "../utils/auth";

function Navbar({ onMenu }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const onLibrary = location.pathname === "/documents";

    const [search, setSearch] = useState(onLibrary ? searchParams.get("q") || "" : "");
    const [theme, setTheme] = useState(getTheme());
    const { username } = getUser();

    // Keep the box in sync if the library's query changes elsewhere
    useEffect(() => {
        if (onLibrary) setSearch(searchParams.get("q") || "");
    }, [onLibrary, searchParams]);

    const goSearch = (value, replace) => {
        const q = value.trim();
        navigate(q ? `/documents?q=${encodeURIComponent(q)}` : "/documents", { replace });
    };

    const handleChange = (e) => {
        setSearch(e.target.value);
        // Live filtering while already on the library page
        if (onLibrary) goSearch(e.target.value, true);
    };

    const today = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <header className="topbar">
            <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
                <i className="bi bi-list"></i>
            </button>

            <form
                className="search-box"
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    goSearch(search, onLibrary);
                }}
            >
                <i className="bi bi-search"></i>
                <input
                    type="search"
                    placeholder="Search your library…"
                    value={search}
                    onChange={handleChange}
                    aria-label="Search documents"
                />
            </form>

            <div className="top-actions">
                <span className="today">
                    <i className="bi bi-calendar3"></i> {today}
                </span>

                <button
                    className="icon-btn"
                    onClick={() => setTheme(toggleTheme())}
                    title={theme === "dark" ? "Switch to day mode" : "Switch to night study mode"}
                    aria-label="Toggle theme"
                >
                    <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`}></i>
                </button>

                <button
                    className="profile"
                    onClick={() => navigate("/settings")}
                    title="Your profile"
                >
                    <span className="avatar">{initials(username)}</span>
                    <span className="profile-name">{username}</span>
                </button>
            </div>
        </header>
    );
}

export default Navbar;
