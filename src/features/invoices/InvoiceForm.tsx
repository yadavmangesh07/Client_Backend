import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Truck, MapPin } from "lucide-react"; 
import { formatISO } from "date-fns";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; 

import { invoiceService } from "@/services/invoiceService";
import { clientService } from "@/services/clientService";
import type { Invoice, Client } from "@/types";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  status: z.string(),
  issuedAt: z.string(),
  dueDate: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  transportMode: z.string().optional(),
  ewayBillNo: z.string().optional(),
  challanNo: z.string().optional(),
  challanDate: z.string().optional(),
  poNumber: z.string().optional(),
  poDate: z.string().optional(),
  tax: z.coerce.number().optional(),

  items: z.array(z.object({
    description: z.string().min(1, "Required"),
    hsnCode: z.string().optional(),
    uom: z.string().optional(),
    taxRate: z.coerce.number().min(0),
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

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "", status: "DRAFT", issuedAt: formatISO(new Date(), { representation: 'date' }),
      dueDate: "", billingAddress: "", shippingAddress: "",
      transportMode: "", ewayBillNo: "", challanNo: "", challanDate: "", poNumber: "", poDate: "",
      tax: 0,
      items: [{ description: "", hsnCode: "", uom: "NOS", taxRate: 18, qty: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = useWatch({ control: form.control, name: "items" });

  useEffect(() => {
    if (open) {
      clientService.getAll().then(setClients).catch(() => toast.error("Failed to load clients"));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (invoiceToEdit) {
        form.reset({
          clientId: invoiceToEdit.clientId,
          status: invoiceToEdit.status,
          issuedAt: invoiceToEdit.issuedAt ? invoiceToEdit.issuedAt.split('T')[0] : "",
          dueDate: invoiceToEdit.dueDate ? invoiceToEdit.dueDate.split('T')[0] : "",
          billingAddress: invoiceToEdit.billingAddress || "",
          shippingAddress: invoiceToEdit.shippingAddress || "",
          transportMode: invoiceToEdit.transportMode || "",
          ewayBillNo: invoiceToEdit.ewayBillNo || "",
          challanNo: invoiceToEdit.challanNo || "",
          challanDate: invoiceToEdit.challanDate ? invoiceToEdit.challanDate.split('T')[0] : "",
          poNumber: invoiceToEdit.poNumber || "",
          poDate: invoiceToEdit.poDate ? invoiceToEdit.poDate.split('T')[0] : "",
          items: invoiceToEdit.items.map(i => ({
            description: i.description,
            hsnCode: i.hsnCode || "",
            uom: i.uom || "NOS",
            taxRate: i.taxRate || 18,
            qty: i.qty,
            rate: i.rate
          })),
        });
      } else {
        form.reset({
          clientId: "", status: "DRAFT", issuedAt: formatISO(new Date(), { representation: 'date' }),
          dueDate: "", billingAddress: "", shippingAddress: "",
          transportMode: "", ewayBillNo: "", challanNo: "", challanDate: "", poNumber: "", poDate: "",
          tax: 0, items: [{ description: "", hsnCode: "", uom: "NOS", taxRate: 18, qty: 1, rate: 0 }],
        });
      }
    }
  }, [open, invoiceToEdit, form]);

  const handleClientChange = (clientId: string) => {
    form.setValue("clientId", clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      form.setValue("billingAddress", client.address || "");
      form.setValue("shippingAddress", client.shippingAddress || client.address || "");
    }
  };

  // --- Calculate Totals ---
  let calculatedSubtotal = 0;
  let calculatedTotalTax = 0;

  if (watchedItems) {
    watchedItems.forEach((item: any) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const taxRate = Number(item.taxRate) || 0;
      
      const lineAmount = qty * rate;
      const lineTax = (lineAmount * taxRate) / 100;
      
      calculatedSubtotal += lineAmount;
      calculatedTotalTax += lineTax;
    });
  }
  const calculatedGrandTotal = calculatedSubtotal + calculatedTotalTax;

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    const payload = {
        ...values,
        issuedAt: new Date(values.issuedAt).toISOString(),
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        challanDate: values.challanDate ? new Date(values.challanDate).toISOString() : undefined,
        poDate: values.poDate ? new Date(values.poDate).toISOString() : undefined,
        tax: calculatedTotalTax,
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoiceToEdit ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="clientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={handleClientChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger></FormControl>
                      <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
              )} />
              <FormField control={form.control} name="issuedAt" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
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
                  </FormItem>
              )} />
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                <FormField control={form.control} name="billingAddress" render={({ field }) => (
                    <FormItem><FormLabel>Billing Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                    <FormItem><FormLabel>Shipping Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
            </div>

            {/* Transport */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border p-4 rounded-md">
                <div className="col-span-2 md:col-span-4 font-semibold flex items-center gap-2 text-sm text-gray-600"><Truck className="h-4 w-4"/> Transport & Order Details</div>
                <FormField control={form.control} name="transportMode" render={({ field }) => <FormItem><FormLabel>Mode</FormLabel><FormControl><Input placeholder="Road" {...field} /></FormControl></FormItem>} />
                <FormField control={form.control} name="ewayBillNo" render={({ field }) => <FormItem><FormLabel>E-Way Bill</FormLabel><FormControl><Input placeholder="No..." {...field} /></FormControl></FormItem>} />
                <FormField control={form.control} name="poNumber" render={({ field }) => <FormItem><FormLabel>PO No</FormLabel><FormControl><Input placeholder="PO..." {...field} /></FormControl></FormItem>} />
                <FormField control={form.control} name="poDate" render={({ field }) => <FormItem><FormLabel>PO Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>} />
                <FormField control={form.control} name="challanNo" render={({ field }) => <FormItem><FormLabel>Challan No</FormLabel><FormControl><Input placeholder="CH..." {...field} /></FormControl></FormItem>} />
                <FormField control={form.control} name="challanDate" render={({ field }) => <FormItem><FormLabel>Challan Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>} />
            </div>

            {/* Items Table */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", hsnCode: "", uom: "NOS", taxRate: 18, qty: 1, rate: 0 })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-3 min-w-[200px]">Description</th>
                                <th className="p-3 w-[100px]">HSN</th>
                                <th className="p-3 w-[80px]">UOM</th>
                                <th className="p-3 w-[80px]">Qty</th>
                                <th className="p-3 w-[100px]">Rate</th>
                                <th className="p-3 w-[80px]">Tax %</th>
                                <th className="p-3 w-[100px]">Amount</th> {/* New Column */}
                                <th className="p-3 w-[120px]">Total (Inc. Tax)</th> {/* New Column */}
                                <th className="p-3 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                        {fields.map((field, index) => {
                            // Calculate live values for display
                            const currentItem = watchedItems?.[index] || {};
                            const qty = Number(currentItem.qty) || 0;
                            const rate = Number(currentItem.rate) || 0;
                            const taxRate = Number(currentItem.taxRate) || 0;
                            const amount = qty * rate;
                            const totalAmount = amount + (amount * taxRate / 100);

                            return (
                                <tr key={field.id} className="hover:bg-gray-50">
                                    <td className="p-2 align-top">
                                        <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                                            <Input {...field} value={field.value as string} placeholder="Item Name" />
                                        )} />
                                    </td>
                                    <td className="p-2 align-top">
                                        <FormField control={form.control} name={`items.${index}.hsnCode`} render={({ field }) => (
                                            <Input {...field} value={field.value as string} placeholder="HSN" />
                                        )} />
                                    </td>
                                    <td className="p-2 align-top">
                                        <FormField control={form.control} name={`items.${index}.uom`} render={({ field }) => (
                                            <Input {...field} value={field.value as string} placeholder="NOS" />
                                        )} />
                                    </td>
                                    <td className="p-2 align-top">
                                        <FormField control={form.control} name={`items.${index}.qty`} render={({ field }) => (
                                            <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                        )} />
                                    </td>
                                    <td className="p-2 align-top">
                                        <FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => (
                                            <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                        )} />
                                    </td>
                                    <td className="p-2 align-top">
                                        <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field }) => (
                                            <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                        )} />
                                    </td>
                                    
                                    {/* 👇 Calculated Columns (Read Only) */}
                                    <td className="p-3 align-top font-medium text-gray-700">
                                        {amount.toFixed(2)}
                                    </td>
                                    <td className="p-3 align-top font-bold text-gray-900">
                                        {totalAmount.toFixed(2)}
                                    </td>

                                    <td className="p-2 align-top">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
                <div className="w-1/3 space-y-2 border p-4 rounded-md bg-gray-50">
                    <div className="flex justify-between text-sm">
                        <span>Base Amount (Subtotal):</span>
                        <span>${calculatedSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Total GST:</span>
                        <span>${calculatedTotalTax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Grand Total:</span>
                        <span>${calculatedGrandTotal.toFixed(2)}</span>
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