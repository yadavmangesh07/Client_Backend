import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Attaches the Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handles Data & Errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // If backend says "403 Forbidden" or "401 Unauthorized", it means token is bad/expired
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only redirect if we are not already on the login page (prevents infinite loops)
      if (window.location.pathname !== "/login") {
         // Optional: Clear storage and redirect to login
         // localStorage.removeItem("token"); 
         // window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;