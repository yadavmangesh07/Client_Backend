import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// 👇 NEW: Import toast directly from "sonner"
import { toast } from "sonner"; 

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientService } from "@/services/clientService";
import type { Client } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientToEdit?: Client | null;
  onSuccess: () => void;
}

export function ClientForm({ open, onOpenChange, clientToEdit, onSuccess }: ClientFormProps) {
  // ❌ DELETE: const { toast } = useToast(); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (clientToEdit) {
        form.reset({
          name: clientToEdit.name,
          email: clientToEdit.email || "",
          phone: clientToEdit.phone || "",
          address: clientToEdit.address || "",
          notes: clientToEdit.notes || "",
        });
      } else {
        form.reset({
            name: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
        });
      }
    }
  }, [open, clientToEdit, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (clientToEdit) {
        await clientService.update(clientToEdit.id, values);
        // ✅ NEW Usage:
        toast.success("Client updated successfully");
      } else {
        await clientService.create(values);
        // ✅ NEW Usage:
        toast.success("Client created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
        // ✅ NEW Usage:
        toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{clientToEdit ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ... (Fields remain exactly the same) ... */}
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* (Add other fields here as before: Email, Phone, Address) */}

            <Button type="submit" className="w-full">
              {clientToEdit ? "Update Client" : "Create Client"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}