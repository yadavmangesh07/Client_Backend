import apiClient from "@/lib/axios";
import type { Company } from "@/types";



export const companyService = {
  getProfile: async () => {
    const response = await apiClient.get<Company>("/company");
    return response.data;
  },
  
  saveProfile: async (data: Company) => {
    const response = await apiClient.post<Company>("/company", data);
    return response.data;
  },

  // Helper to upload Logo/Signature
  uploadFile: async (file: File) => {
    // We reuse your existing generic file upload endpoint
    // NOTE: We need to check if your backend supports a generic /upload endpoint.
    // If you used the InvoiceAttachmentController logic, we might need a dedicated endpoint.
    // For now, let's assume we can POST to /files or similar, or we will fix the backend next.
    
    // TEMPORARY: If you don't have a generic /api/upload endpoint, 
    // we will add a simple one to the FileController later. 
    // For now, let's focus on saving the text data.
    return ""; 
  }
};