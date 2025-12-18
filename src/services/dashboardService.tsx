import apiClient from "@/lib/axios";
import type { Invoice } from "@/types";
export interface MonthlyStat {
  month: string;
  amount: number;
}
export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;     // 👈 This was missing
  totalInvoices: number;
  totalClients: number;
  recentInvoices: Invoice[]; // 👈 This was missing
  monthlyStats: MonthlyStat[]; // 👈 This was missing
}

export const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats");
    return response as unknown as DashboardStats;
  },
};