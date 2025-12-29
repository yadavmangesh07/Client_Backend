import apiClient from "@/lib/axios";
import type { LoginRequest } from "@/types";

export interface User {
  id?: string;
  username: string;
  role: string;
}

export const authService = {
  // 1. LOGIN: Saves Token AND User Role to localStorage
  login: async (creds: LoginRequest) => {
    console.log("Attempting login with:", creds.username); 
    
    // We use 'any' here to safely handle different Axios interceptor configurations
    const response: any = await apiClient.post("/auth/login", creds);
    
    console.log("Server Response:", response); 

    // Handle standard Axios response (response.data) OR intercepted response (response directly)
    const data = response.data || response;

    const token = data.token;
    const role = data.role || "USER"; // Default to USER if backend forgets to send it
    const username = data.username || creds.username;

    if (token) {
      localStorage.setItem("token", token);
      
      // 👇 CRITICAL: Save user details so SettingsPage can check permissions
      localStorage.setItem("user", JSON.stringify({ username, role }));
      
      return { token, role, username };
    } else {
      console.error("Token missing in response:", response);
      throw new Error("Login failed: No token received");
    }
  },

  // 2. GET CURRENT USER: Reads from localStorage (Fixes the missing property error)
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // 3. GET ALL USERS: Fetches list for Admin view
  getAllUsers: async () => {
    const response: any = await apiClient.get<User[]>("/auth/users");
    // Handle if interceptor returns array directly vs standard axios object
    return Array.isArray(response) ? response : (response.data || []);
  },

  // 4. REGISTER: Creates new user (Admin only usually)
  register: async (username: string, password: string, role: string = "USER") => {
    return await apiClient.post("/auth/register", { username, password, role });
  },

  // 5. DELETE USER
  deleteUser: async (id: string) => {
    await apiClient.delete(`/auth/users/${id}`);
  },

  // 6. VERIFY PASSWORD: Used before saving sensitive settings
  verifyPassword: async (password: string) => {
    const response = await apiClient.post("/auth/verify-password", { password });
    return response.data || response;
  },

  // 7. UTILS
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },
};