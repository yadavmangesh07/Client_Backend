import apiClient from "@/lib/axios";
import type { Invoice, PageResponse } from "@/types";

export const invoiceService = {
  // 1. Get all invoices
  getAll: async () => {
    const response = await apiClient.get<Invoice[]>("/invoices");
    return response as unknown as Invoice[];
  },

  // 2. Search with pagination
  search: async (params: any) => {
    const response = await apiClient.get<PageResponse<Invoice>>("/invoices/search", { params });
    return response as unknown as PageResponse<Invoice>;
  },

  // 3. Get single invoice
  getById: async (id: string) => {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response as unknown as Invoice;
  },

  // 4. Create new invoice
  create: async (data: any) => {
    const response = await apiClient.post<Invoice>("/invoices", data);
    return response as unknown as Invoice;
  },

  // 5. Update existing invoice
  update: async (id: string, data: any) => {
    const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
    return response as unknown as Invoice;
  },

  // 6. Delete invoice
  delete: async (id: string) => {
    await apiClient.delete(`/invoices/${id}`);
  },

  // 7. Download PDF
  downloadPdf: async (id: string) => {
    const response = await apiClient.get<Blob>(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    // Cast to Blob because our interceptor returns the raw data (the blob itself)
    return response as unknown as Blob;
  },
};