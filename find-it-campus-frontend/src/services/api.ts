import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT to every request automatically once the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fic_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear stored auth so the app falls
// back to a logged-out state instead of showing broken authenticated UI.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fic_token");
      localStorage.removeItem("fic_user");
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to consistently pull a readable message out of an Axios error.
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Something went wrong";
  }
  return "Something went wrong";
};
