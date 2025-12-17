import apiClient from '@/lib/axios';
import type { Client, PageResponse } from '@/types';

export const clientService = {
  // ✅ FIX: Cast response to Client[] to resolve "data" error
  getAll: async () => {
    const response = await apiClient.get<Client[]>('/clients');
    return response as unknown as Client[];
  },
  
  // Search with pagination
  search: async (q: string = '', page: number = 0, size: number = 10) => {
    const response = await apiClient.get<PageResponse<Client>>('/clients/search', {
      params: { q, page, size }
    });
    return response as unknown as PageResponse<Client>;
  },

  // Get by ID
  getById: async (id: string) => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response as unknown as Client;
  },

  // Create
  create: async (data: Partial<Client>) => {
    const response = await apiClient.post<Client>('/clients', data);
    return response as unknown as Client;
  },

  // Update
  update: async (id: string, data: Partial<Client>) => {
    const response = await apiClient.put<Client>(`/clients/${id}`, data);
    return response as unknown as Client;
  },

  // Delete
  delete: async (id: string) => {
    await apiClient.delete(`/clients/${id}`);
  },
};