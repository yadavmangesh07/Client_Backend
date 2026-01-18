import { useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { purchaseService } from "@/services/purchaseService";
import type { Purchase } from "@/types";
import { PurchaseForm } from "./PurchaseForm";
import { PurchaseList } from "./PurchasesList";
// Ensure path matches your structure

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Purchase | null>(null);

  // Derive unique stores for dropdown autocomplete
  const existingStores = useMemo(() => {
    const stores = purchases.map(p => p.storeName).filter(Boolean);
    return [...new Set(stores)];
  }, [purchases]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const data = await purchaseService.getAll();
      setPurchases(data);
    } catch (error) {
      console.error("Failed to load purchases", error);
    }
  };

  const handleAddNew = () => {
    setEditingData(null);
    setIsFormOpen(true);
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingData(purchase);
    setIsFormOpen(true);
  };

  // 👇 FIXED: Removed native confirm() check
  // The confirmation is now handled by the UI in PurchaseList.tsx
  const handleDelete = async (id: string) => {
    try {
      await purchaseService.delete(id);
      toast.success("Record deleted");
      loadPurchases();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadPurchases();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
            <p className="text-muted-foreground">Manage your vendor invoices and expenses.</p>
        </div>
        <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Purchase
        </Button>
      </div>

      {/* List Component */}
      <PurchaseList 
        data={purchases} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      {/* Form Component (Modal) */}
      <PurchaseForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={handleFormSuccess}
        initialData={editingData}
        existingStores={existingStores}
      />
    </div>
  );
}