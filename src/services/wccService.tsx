import api from "@/lib/axios"; // Assuming you have an axios instance set up
import { type WCCData } from "@/types/wccTypes";
import { generateWCCPdf } from "./wccPdfService";

export const wccService = {
  // 1. Get All
  getAll: async (): Promise<WCCData[]> => {
    const response = await api.get("/wcc");
    return response.data;
  },

  // 2. Get Single
  getById: async (id: string): Promise<WCCData> => {
    const response = await api.get(`/wcc/${id}`);
    return response.data;
  },

  // 3. Create
  create: async (data: WCCData): Promise<WCCData> => {
    const response = await api.post("/wcc", data);
    return response.data;
  },

  // 4. Update
  update: async (id: string, data: WCCData): Promise<WCCData> => {
    const response = await api.put(`/wcc/${id}`, data);
    return response.data;
  },

  // 5. Delete
  delete: async (id: string): Promise<void> => {
    await api.delete(`/wcc/${id}`);
  },

  // 6. Download PDF (Still Client-Side, but fetches data first)
  downloadPdf: async (id: string): Promise<Blob> => {
    // Fetch fresh data from DB first
    const response = await api.get(`/wcc/${id}`);
    const cert = response.data;
    
    // Generate PDF
    return generateWCCPdf(cert);
  }
};