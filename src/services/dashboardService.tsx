import apiClient from "@/lib/axios";

export interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
}

export const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats");
    return response as unknown as DashboardStats;
  },
};