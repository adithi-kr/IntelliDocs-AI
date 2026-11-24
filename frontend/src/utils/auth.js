export const getToken = () => localStorage.getItem("token");

export function getUser() {
    return {
        username: localStorage.getItem("username") || "Student",
        email: localStorage.getItem("email") || "",
    };
}

export function saveSession({ access_token, username, email }) {
    localStorage.setItem("token", access_token);
    localStorage.setItem("username", username || "Student");
    if (email) localStorage.setItem("email", email);
}

export function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
}

/** True when a token exists and has not expired. */
export function isLoggedIn() {
    const token = getToken();
    if (!token) return false;

    try {
        const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(part));

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            clearSession();
            return false;
        }
        return true;
    } catch {
        clearSession();
        return false;
    }
}

export const initials = (name = "") =>
    name.trim().charAt(0).toUpperCase() || "S";
