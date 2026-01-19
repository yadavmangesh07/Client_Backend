import { useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

import { purchaseService } from "@/services/purchaseService";
import type { Purchase, PurchaseStats } from "@/types";

// Components
import { PurchaseForm } from "./PurchaseForm"; 
import { PurchaseList } from "./PurchasesList"; 
import { PurchaseStatsCards } from "./PurchaseStatsCards";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<{ monthly: PurchaseStats; yearly: PurchaseStats } | null>(null);
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Purchase | null>(null);
  const [viewData, setViewData] = useState<Purchase | null>(null); 

  // Filter States (Default to Current Month/Year)
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  // Derive unique stores for dropdown autocomplete
  const existingStores = useMemo(() => {
    const stores = purchases.map(p => p.storeName).filter(Boolean);
    return [...new Set(stores)];
  }, [purchases]);

  // Load Data on Mount & When Filters Change
  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      // 1. Load All Purchases
      const data = await purchaseService.getAll();
      setPurchases(data);

      // 2. Load Stats (Using the Service now, not hardcoded fetch)
      try {
        const statsData = await purchaseService.getStats(parseInt(selectedMonth), parseInt(selectedYear));
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
      
    } catch (error) {
      console.error("Failed to load purchases", error);
    }
  };

  // Filter Purchases Client-Side for the Table
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (!p.invoiceDate) return false;
      const d = new Date(p.invoiceDate);
      return (d.getMonth() + 1) === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
    });
  }, [purchases, selectedMonth, selectedYear]);

  const handleAddNew = () => {
    setEditingData(null);
    setIsFormOpen(true);
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingData(purchase);
    setIsFormOpen(true);
  };

  // Handler for View Details
  const handleView = (purchase: Purchase) => {
    setViewData(purchase);
  };

  const handleDelete = async (id: string) => {
    try {
      await purchaseService.delete(id);
      toast.success("Record deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadData();
  };

  // Helper to get Month Name for UI
  const currentMonthName = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Filters Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
            <p className="text-muted-foreground">Manage your vendor invoices and expenses.</p>
        </div>

        <div className="flex items-center gap-2">
            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px] bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Add Purchase
            </Button>
        </div>
      </div>

      {/* 2. Stats Cards Section */}
      {stats && (
          <PurchaseStatsCards 
            monthly={stats.monthly} 
            yearly={stats.yearly} 
            monthName={currentMonthName}
          />
      )}

      {/* 3. List Component */}
      <PurchaseList 
        data={filteredPurchases} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onRowClick={handleView} // 👈 Uncommented this so clicking rows works!
      />

      {/* 4. Add/Edit Form Modal */}
      <PurchaseForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={handleFormSuccess}
        initialData={editingData}
        existingStores={existingStores}
      />

      {/* 5. View Details Modal */}
      <Dialog open={!!viewData} onOpenChange={(open) => !open && setViewData(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>Invoice #{viewData?.invoiceNo}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
             {/* Key Details Grid */}
             <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                    <label className="text-xs text-muted-foreground block">Store Name</label>
                    <p className="font-semibold text-gray-900">{viewData?.storeName}</p>
                </div>
                <div>
                    <label className="text-xs text-muted-foreground block">Invoice Date</label>
                    <p className="font-medium text-gray-900">{viewData?.invoiceDate}</p>
                </div>
                <div>
                    <label className="text-xs text-muted-foreground block">Total Amount</label>
                    <p className="font-semibold text-gray-900">₹{viewData?.totalAmount}</p>
                </div>
                <div>
                    <label className="text-xs text-muted-foreground block">Payment Status</label>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        viewData?.status?.toLowerCase().includes('paid') && !viewData?.status?.toLowerCase().includes('un') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                        {viewData?.status}
                    </span>
                </div>
                <div>
                    <label className="text-xs text-muted-foreground block">Amount Paid</label>
                    <p className="font-medium text-gray-700">₹{viewData?.amountPaid}</p>
                </div>
                <div>
                     <label className="text-xs text-muted-foreground block">Created By</label>
                     <p className="font-medium text-gray-700">{viewData?.createdBy}</p>
                </div>
             </div>
             
             {/* Remarks Section */}
             <div className="bg-muted/40 p-3 rounded-md border mt-2">
                <label className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
                    Remarks / Notes
                </label>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">
                    {viewData?.remarks || <span className="text-muted-foreground italic">No remarks added.</span>}
                </p>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}