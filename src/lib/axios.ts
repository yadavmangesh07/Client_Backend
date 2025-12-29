import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
// 1. Create the Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL, // Make sure this matches your Backend port
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Add Request Interceptor (The Magic Part)
apiClient.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const token = localStorage.getItem("token");
    
    // If token exists, attach it to the header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Add Response Interceptor (Optional: Handle Token Expiry)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      console.error("Access Forbidden. You might not have the right permissions.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;