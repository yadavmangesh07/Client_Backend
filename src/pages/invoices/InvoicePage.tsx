import { useEffect, useState } from "react";
import { Plus, Filter, X, MoreHorizontal, Eye, FileDown, Truck, Mail, Pencil, Trash2, AlertTriangle } from "lucide-react";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added
  DialogFooter,      // Added
} from "@/components/ui/dialog";

// Services & Types
import { invoiceService } from "@/services/invoiceService";
import { clientService } from "@/services/clientService"; 
import type { Invoice, PageResponse, Client } from "@/types";

// Import Forms
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import { EwayBillDialog } from "@/features/invoices/EwayBillDialog";
import { InvoiceEmailDialog } from "@/features/invoices/InvoiceEmailDialog";

export default function InvoicePage() {
  const [data, setData] = useState<PageResponse<Invoice> | null>(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]); 
  
  const [filterClient, setFilterClient] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("desc"); 

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [ewayDialog, setEwayDialog] = useState<{open: boolean, invId: string, currentNo: string}>({
      open: false, invId: "", currentNo: ""
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [emailDialogData, setEmailDialogData] = useState<{id: string, no: string, email: string} | null>(null);

  // 👇 Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    clientService.getAll().then(setClients).catch(console.error);
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 0,
        size: 20, 
        sort: `issuedAt,${sortOrder}`
      };
      if (filterClient && filterClient !== "ALL") params.clientId = filterClient;
      if (filterStatus && filterStatus !== "ALL") params.status = filterStatus;

      const res = await invoiceService.search(params);
      setData(res);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, [filterClient, filterStatus, sortOrder]);

  // 👇 1. Open Dialog
  const initiateDelete = (id: string) => {
    setDeleteId(id);
  };

  // 👇 2. Confirm Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await invoiceService.delete(deleteId);
      toast.success("Invoice deleted");
      loadInvoices();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreate = () => { setEditingInvoice(null); setIsFormOpen(true); };
  const handleEdit = (inv: Invoice) => { setEditingInvoice(inv); setIsFormOpen(true); };

  const handleViewPdf = async (invoice: Invoice) => {
    try {
      toast.info("Loading Preview...");
      const blob = await invoiceService.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load PDF preview");
    }
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      toast.info("Downloading PDF...");
      const blob = await invoiceService.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handleSendEmail = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    setEmailDialogData({
        id: inv.id,
        no: inv.invoiceNo,
        email: client?.email || "" 
    });
  };

  const handleDownloadEway = async (invoice: Invoice) => {
    try {
      toast.info("Generating E-Way JSON...");
      const blob = await invoiceService.downloadEwayJson(invoice.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ewaybill_${invoice.invoiceNo}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("JSON downloaded!");
    } catch (error) {
      toast.error("Failed to generate JSON. Check Pincodes.");
    }
  };

  const openEwayDialog = (inv: Invoice) => {
    setEwayDialog({ open: true, invId: inv.id, currentNo: inv.ewayBillNo || "" });
  };

  const resetFilters = () => {
    setFilterClient("ALL");
    setFilterStatus("ALL");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage and track your client invoices.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-md border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mr-2">
            <Filter className="h-4 w-4" /> Filters:
        </div>
        <div className="w-[200px]">
            <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="h-9"><SelectValue placeholder="All Clients" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Clients</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="w-[150px]">
             <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="w-[160px]">
             <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Sort Date" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {(filterClient !== "ALL" || filterStatus !== "ALL") && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50">
                <X className="mr-1 h-3 w-3" /> Reset
            </Button>
        )}
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead> 
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading invoices...</TableCell></TableRow>
            ) : !data?.content || data.content.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No invoices found.</TableCell></TableRow>
            ) : (
              data.content.map((inv) => {
                const clientName = clients.find(c => c.id === inv.clientId)?.name || "Unknown Client";
                
                return (
                <TableRow 
                    key={inv.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewPdf(inv)}
                >
                  <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                  <TableCell>{clientName}</TableCell>
                  <TableCell>{inv.issuedAt ? format(new Date(inv.issuedAt), 'MMM dd, yyyy') : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">₹{inv.total.toFixed(2)}</TableCell>
                  
                  <TableCell 
                    className="text-right" 
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        <DropdownMenuItem onClick={() => handleViewPdf(inv)}>
                          <Eye className="mr-2 h-4 w-4" /> View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPdf(inv)}>
                          <FileDown className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleDownloadEway(inv)}>
                          <Truck className="mr-2 h-4 w-4" /> Generate E-Way JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEwayDialog(inv)}>
                          <Truck className="mr-2 h-4 w-4" /> 
                          {inv.ewayBillNo ? "Update E-Way No" : "Add E-Way No"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => handleSendEmail(inv)}>
                          <Mail className="mr-2 h-4 w-4" /> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(inv)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        {/* 👇 UPDATED: Use initiateDelete */}
                        <DropdownMenuItem onClick={() => initiateDelete(inv.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Invoice
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <EwayBillDialog 
        open={ewayDialog.open} 
        onOpenChange={(val) => setEwayDialog(prev => ({ ...prev, open: val }))}
        invoiceId={ewayDialog.invId}
        currentEwayNo={ewayDialog.currentNo}
        onSuccess={loadInvoices} 
      />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b bg-white rounded-t-lg">
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-gray-100 p-0 overflow-hidden">
            {previewUrl && (
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0" 
                title="Invoice Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {emailDialogData && (
        <InvoiceEmailDialog 
            open={!!emailDialogData} 
            onOpenChange={(open) => !open && setEmailDialogData(null)}
            invoiceId={emailDialogData.id}
            invoiceNo={emailDialogData.no}
            clientEmail={emailDialogData.email}
        />
      )}

      {/* 👇 Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" /> Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this invoice? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete}>Delete Invoice</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}