import { NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { clearSession, getUser, initials } from "../utils/auth";

const menuItems = [
    { name: "Study Desk", path: "/dashboard", icon: "bi-house-heart" },
    { name: "Upload Notes", path: "/upload", icon: "bi-cloud-arrow-up" },
    { name: "My Library", path: "/documents", icon: "bi-bookshelf" },
    { name: "Ask AI Tutor", path: "/chat", icon: "bi-chat-square-quote" },
    { name: "Settings", path: "/settings", icon: "bi-sliders" },
];

function Sidebar({ open, onClose }) {
    const navigate = useNavigate();
    const { username } = getUser();

    const handleLogout = () => {
        clearSession();
        navigate("/", { replace: true });
    };

    return (
        <aside className={`sidebar ${open ? "open" : ""}`}>
            <div className="sidebar-top">
                <div className="sidebar-head">
                    <Logo subtitle="Study Desk" light />
                    <button
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/documents"}
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-note">
                    <span className="hand">Keep going,</span>
                    <span>small steps every day ✦</span>
                </div>

                <div className="sidebar-user">
                    <div className="avatar">{initials(username)}</div>
                    <div className="sidebar-user-info">
                        <strong>{username}</strong>
                        <small>Student</small>
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Log out"
                        aria-label="Log out"
                    >
                        <i className="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
