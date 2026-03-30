import axios from "axios";

// -------------------------------------
// BASE URL (from .env)
// -------------------------------------
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9091";

// -------------------------------------
// AXIOS INSTANCE
// -------------------------------------
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json", // default
  },
});

// -------------------------------------
// REQUEST INTERCEPTOR
// Attach token automatically
// -------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If sending FormData, let browser set Content-Type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------------
// RESPONSE INTERCEPTOR
// Auto logout on 401 (optional)
// -------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired, logging out…");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// -------------------------------------
// EXPORT
// -------------------------------------
export default api;
