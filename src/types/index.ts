// src/types/index.ts

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Attachment {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'PAID' | 'UNPAID' | 'PARTIAL';
  issuedAt: string;
  dueDate?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt?: string;
}

// 👇 THIS IS THE PART YOU LIKELY MISSED
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}