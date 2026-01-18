import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// 👇 Added CommandList to imports
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { authService } from "@/services/authService";
import { purchaseService } from "@/services/purchaseService";
import type { Purchase } from "@/types";

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Purchase | null;
  existingStores: string[];
}

export function PurchaseForm({ isOpen, onClose, onSuccess, initialData, existingStores }: PurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [openStoreDropdown, setOpenStoreDropdown] = useState(false); 

  const defaultState: Purchase = {
    storeName: "",
    invoiceNo: "",
    invoiceDate: format(new Date(), "yyyy-MM-dd"),
    totalAmount: 0,
    amountPaid: 0,
    paymentMode: "Bank Transfer",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    status: "Unpaid",
    createdBy: ""
  };

  const [formData, setFormData] = useState<Purchase>(defaultState);

  // Load data on open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
            ...initialData,
            invoiceDate: format(new Date(initialData.invoiceDate), "yyyy-MM-dd"),
            paymentDate: format(new Date(initialData.paymentDate), "yyyy-MM-dd"),
        });
      } else {
        const user = authService.getCurrentUser();
        setFormData({ 
            ...defaultState, 
            createdBy: user?.username || "Unknown" 
        });
      }
    }
  }, [isOpen, initialData]);

  // Auto-Calculate Status
  useEffect(() => {
    const total = Number(formData.totalAmount) || 0;
    const paid = Number(formData.amountPaid) || 0;
    
    let newStatus = "Unpaid";
    if (paid >= total && total > 0) newStatus = "Full Paid";
    else if (paid > 0) newStatus = "Partially Paid";

    if (formData.status !== newStatus) {
        setFormData((prev: any) => ({ ...prev, status: newStatus }));
    }
  }, [formData.totalAmount, formData.amountPaid]);

  const handleSubmit = async () => {
    if (!formData.storeName || !formData.totalAmount) {
      return toast.error("Store Name and Total Amount are required");
    }
    
    setIsLoading(true);
    try {
      if (initialData && initialData.id) {
        await purchaseService.update(initialData.id, formData);
        toast.success("Purchase updated");
      } else {
        await purchaseService.create(formData);
        toast.success("Purchase created");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const unpaidAmount = Math.max(0, (formData.totalAmount || 0) - (formData.amountPaid || 0));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-visible">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Purchase" : "Add New Purchase"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          
          {/* Row 1: Store & Invoice */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Store Dropdown */}
            <div className="grid gap-2">
                <Label>Store Name</Label>
                <Popover open={openStoreDropdown} onOpenChange={setOpenStoreDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openStoreDropdown}
                      className="justify-between w-full font-normal"
                    >
                      {formData.storeName || "Select or Type Store..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search store..." 
                        onValueChange={(val: string) => {
                           if(val) setFormData({...formData, storeName: val});
                        }}
                      />
                      {/* 👇 FIXED: Wrapped in CommandList to prevent crash */}
                      <CommandList>
                        <CommandEmpty>
                            <p className="text-xs text-muted-foreground p-2">
                               Press Enter to use "{formData.storeName}"
                            </p>
                        </CommandEmpty>
                        <CommandGroup>
                          {existingStores.map((store) => (
                            <CommandItem
                              key={store}
                              value={store}
                              onSelect={(currentValue: string) => {
                                setFormData({...formData, storeName: currentValue});
                                setOpenStoreDropdown(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.storeName === store ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {store}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-2">
               <Label>Invoice No</Label>
               <Input value={formData.invoiceNo} onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})} />
            </div>
          </div>

          {/* Row 2: Amounts */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid gap-2">
               <Label>Total Amount</Label>
               <Input type="number" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value)})} />
            </div>
            <div className="grid gap-2">
               <Label>Amount Paid</Label>
               <Input type="number" value={formData.amountPaid} onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})} />
            </div>
            <div className="grid gap-2">
               <Label className="text-muted-foreground">Unpaid</Label>
               <Input disabled value={unpaidAmount} className="bg-gray-200 font-semibold text-red-600" />
            </div>
          </div>

          {/* Row 3: Dates & Payment */}
          <div className="grid grid-cols-3 gap-4">
             <div className="grid gap-2">
               <Label>Invoice Date</Label>
               <Input type="date" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
            </div>
            <div className="grid gap-2">
                <Label>Payment Mode</Label>
                <Select value={formData.paymentMode} onValueChange={(val) => setFormData({...formData, paymentMode: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
               <Label>Payment Date</Label>
               <Input type="date" value={formData.paymentDate} onChange={(e) => setFormData({...formData, paymentDate: e.target.value})} />
            </div>
          </div>
          
          <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">Entry by: <span className="font-medium text-gray-900">{formData.createdBy}</span></span>
          </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Record"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}