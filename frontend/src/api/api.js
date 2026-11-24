import axios from "axios";
import { clearSession, getToken } from "../utils/auth";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Expired/invalid session → back to the login page
        if (error.response?.status === 401 && getToken()) {
            clearSession();
            window.location.assign(import.meta.env.BASE_URL);
        }
        return Promise.reject(error);
    }
);

/** Turn an axios error into a friendly sentence. */
export function errorMessage(error, fallback = "Something went wrong.") {
    if (!error?.response) {
        return "Can't reach the server. Is the backend running on port 8000?";
    }

    const detail = error.response.data?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail) && detail[0]?.msg) {
        return detail[0].msg.replace(/^Value error,\s*/i, "");
    }

    return fallback;
}

export default api;
