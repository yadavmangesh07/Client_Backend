import { useState, useEffect } from "react";
import { Loader2, Send, Paperclip, X, FileText } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNo: string;
  clientEmail: string;
}

export function InvoiceEmailDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNo,
  clientEmail,
}: InvoiceEmailDialogProps) {
  const [toEmail, setToEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setToEmail(clientEmail || "");
      setFiles([]);
    }
  }, [open, clientEmail]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!toEmail) return toast.error("Please enter a recipient email.");

    setLoading(true);
    const toastId = toast.loading("Sending email...");

    try {
      const formData = new FormData();
      formData.append("invoiceId", invoiceId);
      formData.append("toEmail", toEmail);
      
      files.forEach((file) => {
        formData.append("files", file);
      });

      // API Call to your new endpoint
      await apiClient.post("/email/send-invoice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Invoice #${invoiceNo} sent successfully!`, { id: toastId });
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to send email.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Invoice via Email</DialogTitle>
          <DialogDescription>
            Review recipient details for Invoice <b>#{invoiceNo}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label>Attachments (Optional)</Label>
            
            {files.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeFile(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Paperclip className="mr-2 h-4 w-4" /> Attach Files
                </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading || !toEmail}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}