import apiClient from '@/lib/axios';
import type { Client, PageResponse } from '@/types';

export const clientService = {
  // ✅ FIX: Ensure this always returns an Array []
  getAll: async () => {
    try {
      const response = await apiClient.get<Client[]>('/clients');
      // If response.data exists and is an array, return it.
      // If it's wrapped in an object (like { data: [...] }), extract it.
      // Otherwise, return an empty array [] to prevent crashes.
      const data = response.data;
      if (Array.isArray(data)) return data;
      // @ts-ignore - Handle case where backend wraps it in { content: ... }
      if (data && Array.isArray(data.content)) return data.content;
      return [];
    } catch (error) {
      console.error("Failed to fetch clients", error);
      return []; // Return empty array on error
    }
  },
  
  // Search with pagination
  search: async (q: string = '', page: number = 0, size: number = 10) => {
    const response = await apiClient.get<PageResponse<Client>>('/clients/search', {
      params: { q, page, size }
    });
    return response.data;
  },

  // Get by ID
  getById: async (id: string) => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  // Create
  create: async (data: Partial<Client>) => {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  },

  // Update
  update: async (id: string, data: Partial<Client>) => {
    const response = await apiClient.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  // Delete
  delete: async (id: string) => {
    await apiClient.delete(`/clients/${id}`);
  },
};