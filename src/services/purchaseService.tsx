import axios from "@/lib/axios";
// 👇 FIX 1: Removed invalid 'export' keyword from import
import type { Purchase } from "@/types";

export const purchaseService = {
  getAll: async () => {
    const response = await axios.get<Purchase[]>("/purchases");
    return response.data;
  },
  create: async (data: Purchase) => {
    const response = await axios.post<Purchase>("/purchases", data);
    return response.data;
  },
  delete: async (id: string) => {
    await axios.delete(`/purchases/${id}`);
  },
  update: async (id: string, data: Purchase) => {
    // 👇 FIX 2: Added leading slash '/' and changed 'purchase' to 'purchases' (plural)
    const response = await axios.put<Purchase>(`/purchases/${id}`, data);
    return response.data;
  }
};