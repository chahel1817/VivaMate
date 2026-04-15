import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send cookies with requests
});

api.interceptors.request.use((config) => {
  const offset = new Date().getTimezoneOffset();
  config.headers = config.headers || {};
  config.headers["x-timezone-offset"] = offset;
  return config;
});

// Response interceptor to handle global errors like Rate Limiting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      // Show user-friendly, non-technical message
      const message = error.response.data?.message || "Whoa! You're moving a bit too fast. Please take a small break and try again in a few minutes.";
      toast.error(message, {
        id: 'rate-limit-toast', // Prevent duplicate toasts
        duration: 5000,
        icon: '⏳'
      });
    }
    return Promise.reject(error);
  }
);

export default api;
