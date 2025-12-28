import apiClient from "@/lib/axios";
import type { LoginRequest } from "@/types";
export interface User {
  id: string;
  username: string;
  role: string;
}
export const authService = {
  login: async (creds: LoginRequest) => {
    console.log("Attempting login with:", creds.username); // Debug log
    
    // 1. Make the request
    // We type it as 'any' temporarily to handle different Axios configurations safely
    const response: any = await apiClient.post("/auth/login", creds);
    
    console.log("Server Response:", response); // Check your console to see this!

    // 2. Handle different response structures
    // Case A: Standard Axios (response.data.token)
    // Case B: Interceptor Extracted (response.token)
    const token = response.data?.token || response.token;

    if (token) {
      localStorage.setItem("token", token);
      return { token };
    } else {
      console.error("Token missing in response:", response);
      throw new Error("Login failed: No token received");
    }
  },
  getAllUsers: async () => {
    const response = await apiClient.get<User[]>("/auth/users");
    return response.data;
  },

  deleteUser: async (id: string) => {
    await apiClient.delete(`/auth/users/${id}`);
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  register: async (username: string, password: string, role: string = "USER") => {
    return await apiClient.post("/auth/register", { username, password, role });
  },
  // ... inside authService object

  verifyPassword: async (password: string) => {
    const response = await apiClient.post("/auth/verify-password", { password });
    return response.data;
  },

// ...
  
};