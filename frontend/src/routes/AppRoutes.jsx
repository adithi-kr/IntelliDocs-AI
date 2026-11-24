import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import Documents from "../pages/Documents";
import DocumentDetails from "../pages/DocumentDetails";
import Chat from "../pages/Chat";
import Settings from "../pages/Settings";

import ProtectedRoute from "../components/ProtectedRoute";
import { isLoggedIn } from "../utils/auth";

function PublicOnly({ children }) {
    return isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
}

const protectedPages = [
    ["/dashboard", Dashboard],
    ["/upload", Upload],
    ["/documents", Documents],
    ["/documents/:id", DocumentDetails],
    ["/chat", Chat],
    ["/settings", Settings],
];

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

            {protectedPages.map(([path, Page]) => (
                <Route
                    key={path}
                    path={path}
                    element={<ProtectedRoute><Page /></ProtectedRoute>}
                />
            ))}

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default AppRoutes;
