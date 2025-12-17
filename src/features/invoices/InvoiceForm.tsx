import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatISO } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { invoiceService } from "@/services/invoiceService";
import { clientService } from "@/services/clientService";
import type { Invoice, Client } from "@/types";

// 1. Schema Definition
const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  status: z.string(),
  issuedAt: z.string(),
  dueDate: z.string().optional(),
  tax: z.coerce.number().min(0),
  items: z.array(z.object({
    description: z.string().min(1, "Description required"),
    qty: z.coerce.number().min(1),
    rate: z.coerce.number().min(0),
  })).min(1, "Add at least one item"),
});

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceToEdit?: Invoice | null;
  onSuccess: () => void;
}

export function InvoiceForm({ open, onOpenChange, invoiceToEdit, onSuccess }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);

  // 2. Initialize Form (No generic type passed to useForm to let inference work)
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      status: "DRAFT",
      issuedAt: formatISO(new Date(), { representation: 'date' }),
      dueDate: "",
      tax: 0,
      items: [{ description: "", qty: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch values for real-time calculation
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedTax = useWatch({ control: form.control, name: "tax" });

  // Safe Math Calculation
  const subtotal = watchedItems?.reduce((acc: number, item: any) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    return acc + (qty * rate);
  }, 0) || 0;

  const total = subtotal + (Number(watchedTax) || 0);

  // Load Clients
  useEffect(() => {
    if (open) {
      clientService.getAll()
        .then((data) => setClients(data)) // This will now work because clientService is fixed
        .catch(() => toast.error("Failed to load clients"));
    }
  }, [open]);

  // Handle Edit vs Create Reset
  useEffect(() => {
    if (open) {
      if (invoiceToEdit) {
        form.reset({
          clientId: invoiceToEdit.clientId,
          status: invoiceToEdit.status,
          issuedAt: invoiceToEdit.issuedAt ? invoiceToEdit.issuedAt.split('T')[0] : "",
          dueDate: invoiceToEdit.dueDate ? invoiceToEdit.dueDate.split('T')[0] : "",
          tax: invoiceToEdit.tax,
          items: invoiceToEdit.items.map(i => ({
            description: i.description,
            qty: i.qty,
            rate: i.rate
          })),
        });
      } else {
        form.reset({
          clientId: "",
          status: "DRAFT",
          issuedAt: formatISO(new Date(), { representation: 'date' }),
          dueDate: "",
          tax: 0,
          items: [{ description: "", qty: 1, rate: 0 }],
        });
      }
    }
  }, [open, invoiceToEdit, form]);

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    // Safe Date Conversion
    const payload = {
        ...values,
        issuedAt: new Date(values.issuedAt).toISOString(),
        // Only convert dueDate if it is not empty
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    };

    try {
      if (invoiceToEdit) {
        await invoiceService.update(invoiceToEdit.id, payload);
        toast.success("Invoice updated");
      } else {
        await invoiceService.create(payload);
        toast.success("Invoice created");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoiceToEdit ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issued Date</FormLabel>
                    <FormControl>
                      {/* Ensure value is never null */}
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items Table */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", qty: 1, rate: 0 })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </div>
                
                <div className="border rounded-md p-4 space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Description" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.qty`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="number" placeholder="Qty" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-3">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.rate`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="number" placeholder="Rate" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-1">
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-1/3 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <FormField
                        control={form.control}
                        name="tax"
                        render={({ field }) => (
                            <FormItem className="flex justify-between items-center space-y-0">
                                <FormLabel className="mr-4">Tax:</FormLabel>
                                <FormControl>
                                    <Input type="number" className="w-24 text-right h-8" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full">
              {invoiceToEdit ? "Update Invoice" : "Create Invoice"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}