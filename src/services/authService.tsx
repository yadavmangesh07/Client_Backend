import apiClient from "@/lib/axios";

// 1. Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export const authService = {
  // 2. Login Function
  login: async (creds: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>("/auth/login", creds);
    const data = response as unknown as AuthResponse;
    
    // 3. Save Token to Browser Storage
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ username: data.username, role: data.role }));
    }
    return data;
  },

  // 4. Logout Function
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // Force redirect
  },

  // 5. Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
  
  // 6. Get current token
  getToken: () => {
    return localStorage.getItem("token");
  }
};