import apiClient from "@/lib/axios";
import type { Invoice, PageResponse } from "@/types";

export const invoiceService = {
  // ✅ FIX: Added 'size' and 'number' to satisfy the PageResponse type
  search: async (params: any) => {
    try {
      const response = await apiClient.get<any>("/invoices/search", { params });
      
      // Case 1: Backend returns a standard Spring Boot Page ({ content: [...] })
      if (response.data && Array.isArray(response.data.content)) {
        return response.data as PageResponse<Invoice>;
      }
      
      // Case 2: Backend returns a raw List ([...]) -> Wrap it manually
      if (Array.isArray(response.data)) {
        return {
          content: response.data,
          totalElements: response.data.length,
          totalPages: 1,
          last: true,
          first: true,
          size: response.data.length, // 👈 Added
          number: 0                   // 👈 Added
        } as PageResponse<Invoice>;
      }

      // Case 3: Empty or error -> Return valid empty Page
      return { 
        content: [], 
        totalElements: 0, 
        totalPages: 0, 
        last: true, 
        first: true, 
        size: params.size || 20, // 👈 Added
        number: 0                // 👈 Added
      } as PageResponse<Invoice>;

    } catch (error) {
      console.error("Failed to load invoices", error);
      // Return safe empty object on crash
      return { 
        content: [], 
        totalElements: 0, 
        totalPages: 0, 
        last: true, 
        first: true, 
        size: 20, 
        number: 0 
      } as PageResponse<Invoice>;
    }
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: Partial<Invoice>) => {
    const response = await apiClient.post<Invoice>("/invoices", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Invoice>) => {
    const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/invoices/${id}`);
  },

  downloadPdf: async (id: string) => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },
  downloadEwayJson: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/invoices/${id}/eway-json`, {
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  },
};