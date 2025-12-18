import { useEffect, useState } from "react";
import { Plus, FileDown, Trash2, Pencil, Mail, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Services & Types
import { invoiceService } from "@/services/invoiceService";
import { clientService } from "@/services/clientService"; // Import Client Service
import apiClient from "@/lib/axios"; 
import type { Invoice, PageResponse, Client } from "@/types";

// Import the form
import { InvoiceForm } from "@/features/invoices/InvoiceForm"; 

export default function InvoicePage() {
  const [data, setData] = useState<PageResponse<Invoice> | null>(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]); // Store list of clients for filter
  
  // --- Filter States ---
  const [filterClient, setFilterClient] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("desc"); // desc = Newest First

  // State for the popup form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // 1. Load Clients (for the dropdown)
  useEffect(() => {
    clientService.getAll().then(setClients).catch(console.error);
  }, []);

  // 2. Load Invoices (Triggers whenever filters change)
  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Build Query Params based on state
      const params: any = {
        page: 0,
        size: 20, // Adjust page size as needed
        sort: `issuedAt,${sortOrder}`
      };

      if (filterClient && filterClient !== "ALL") {
        params.clientId = filterClient;
      }
      
      if (filterStatus && filterStatus !== "ALL") {
        params.status = filterStatus;
      }

      const res = await invoiceService.search(params);
      setData(res);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Re-run search when any filter changes
  useEffect(() => {
    loadInvoices();
  }, [filterClient, filterStatus, sortOrder]);

  // --- Actions ---
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await invoiceService.delete(id);
      toast.success("Invoice deleted");
      loadInvoices();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setIsFormOpen(true);
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      toast.info("Generating PDF...");
      const blob = await invoiceService.downloadPdf(invoice.id);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    }
  };

  const handleSendEmail = async (inv: Invoice) => {
    if (!confirm(`Send invoice #${inv.invoiceNo} to client via email?`)) return;
    const toastId = toast.loading("Sending email...");
    try {
      await apiClient.post(`/invoices/${inv.id}/send-email`);
      toast.success("Email sent successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send email.", { id: toastId });
    }
  };

  // Helper to clear filters
  const resetFilters = () => {
    setFilterClient("ALL");
    setFilterStatus("ALL");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage and track your client invoices.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* 🔍 FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-md border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mr-2">
            <Filter className="h-4 w-4" /> Filters:
        </div>

        {/* Client Filter */}
        <div className="w-[200px]">
            <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Clients</SelectItem>
                    {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* Status Filter */}
        <div className="w-[150px]">
             <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* Sort Order */}
        <div className="w-[160px]">
             <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sort Date" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* Reset Button (Only show if filters are active) */}
        {(filterClient !== "ALL" || filterStatus !== "ALL") && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50">
                <X className="mr-1 h-3 w-3" /> Reset
            </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead> {/* Added Client Name Column */}
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading invoices...</TableCell>
              </TableRow>
            ) : !data?.content || data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No invoices found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.content.map((inv) => {
                // Find client name safely
                const clientName = clients.find(c => c.id === inv.clientId)?.name || "Unknown Client";
                
                return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                  <TableCell>{clientName}</TableCell> {/* Display Client Name */}
                  <TableCell>
                    {inv.issuedAt ? format(new Date(inv.issuedAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'}>
                        {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${inv.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(inv)} title="Download PDF">
                      <FileDown className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleSendEmail(inv)} title="Send Email">
                      <Mail className="h-4 w-4 text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(inv)} title="Edit">
                       <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>

      <InvoiceForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        invoiceToEdit={editingInvoice}
        onSuccess={loadInvoices}
      />
    </div>
  );
}