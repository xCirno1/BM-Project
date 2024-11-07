import axios from 'axios';
import { toast } from 'react-toastify';

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.data === "Could not refresh access token.") {
      const countdown = 5;
      toast.error(`Session has expired! Returning to the login page in ${countdown} seconds.`, {
        position: "bottom-left",
        toastId: "toast-session-error",
        autoClose: countdown * 1000
      });

      console.warn("Access token refresh failed. Redirecting to login...");

      setTimeout(() => {
        window.location.href = "/login";
      }, countdown * 1000);    }

    return Promise.reject(error);
  }
);
export default api;
