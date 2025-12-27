import { useState } from "react";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import apiClient from "@/lib/axios";

interface EwayBillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoiceId: string;
    currentEwayNo?: string;
    onSuccess: () => void;
}

export function EwayBillDialog({ open, onOpenChange, invoiceId, currentEwayNo, onSuccess }: EwayBillDialogProps) {
    const [ewayNo, setEwayNo] = useState(currentEwayNo || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!ewayNo) return toast.error("Please enter a valid number");
        
        setLoading(true);
        try {
            await apiClient.patch(`/invoices/${invoiceId}/eway-bill`, { ewayBillNo: ewayNo });
            toast.success("E-Way Bill Number Saved!");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-purple-600" />
                        Update E-Way Bill No
                    </DialogTitle>
                </DialogHeader>
                
                <div className="py-4 space-y-2">
                    <p className="text-sm text-gray-500">
                        Paste the 12-digit E-Way Bill Number generated from the GST Portal.
                    </p>
                    <Input 
                        placeholder="e.g. 141234567890" 
                        value={ewayNo} 
                        onChange={(e) => setEwayNo(e.target.value)} 
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Number"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}