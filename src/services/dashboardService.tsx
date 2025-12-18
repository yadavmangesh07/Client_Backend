import apiClient from "@/lib/axios";
import type { Invoice } from "@/types";

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  totalInvoices: number;
  totalClients: number;
  recentInvoices: Invoice[];
  monthlyStats: any[];
}

export const dashboardService = {
  getStats: async () => {
    // 1. Call the endpoint
    const response = await apiClient.get<DashboardStats>("/dashboard");
    
    // 2. Return data directly (Axios interceptor usually handles .data, but just in case)
    return response.data; 
  },
};