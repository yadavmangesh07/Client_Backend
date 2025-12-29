import apiClient from "@/lib/axios";

export interface ChallanItem {
  description: string;
  size: string;
  hsn: string;
  qty: number;
}

export interface Challan {
  id?: string;
  challanNo: string;
  challanDate: string; 
  orderNo: string;
  orderDate: string;
  clientName: string;
  clientAddress: string;
  clientGst: string;
  clientState: string;
  clientStateCode: string;
  contactPerson: string;
  items: ChallanItem[];
}

export const challanService = {
  getAll: async () => {
    const response = await apiClient.get<Challan[]>("/challans");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Challan>(`/challans/${id}`);
    return response.data;
  },

  create: async (data: Challan) => {
    const response = await apiClient.post<Challan>("/challans", data);
    return response.data;
  },

  // 👇 NEW: Update Method
  update: async (id: string, data: Challan) => {
    const response = await apiClient.put<Challan>(`/challans/${id}`, data);
    return response.data;
  },

  // 👇 NEW: Delete Method
  delete: async (id: string) => {
    await apiClient.delete(`/challans/${id}`);
  },

  downloadPdf: async (id: string) => {
    const response = await apiClient.get(`/challans/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  }
};