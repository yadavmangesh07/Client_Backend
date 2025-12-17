import { useEffect, useState } from "react";
import { Plus, FileDown, Trash2, Pencil } from "lucide-react";
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

// Services & Types
import { invoiceService } from "@/services/invoiceService";
import type { Invoice, PageResponse } from "@/types";

// Import the form
import { InvoiceForm } from "@/features/invoices/InvoiceForm"; 

export default function InvoicePage() {
  const [data, setData] = useState<PageResponse<Invoice> | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State for the popup form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // 1. Fetch Invoices
  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.search({});
      setData(res);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // 2. Actions
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
      
      // Create a hidden link to force download
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          {/* 👇 FIX APPLIED HERE */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : !data?.content || data.content.length === 0 ? (
              // ^ Checked if content exists explicitly
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">No invoices found.</TableCell>
              </TableRow>
            ) : (
              data.content?.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
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
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(inv)} title="Download PDF">
                      <FileDown className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(inv)} title="Edit">
                       <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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