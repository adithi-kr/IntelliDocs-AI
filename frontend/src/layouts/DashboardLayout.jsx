import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    // Close the mobile menu whenever the page changes
    useEffect(() => setMenuOpen(false), [location.pathname]);

    return (
        <div className="app-shell">
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

            {menuOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="main-area">
                <Navbar onMenu={() => setMenuOpen(true)} />
                <main className="content">{children}</main>
            </div>
        </div>
    );
}

export default DashboardLayout;
