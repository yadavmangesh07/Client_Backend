import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
// 👇 Removed 'CircleCheck'
import { Mail, Phone, MapPin, User, Building2, Map, Hash } from "lucide-react"; 
import { INDIAN_STATES } from "@/constants/constants";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { clientService } from "@/services/clientService";
import type { Client } from "@/types";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  gstin: z.string().optional().or(z.literal("")),
  pincode: z.string().min(6, "Must be 6 digits").optional().or(z.literal("")), 
  state: z.string().optional().or(z.literal("")),
  stateCode: z.string().optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientToEdit?: Client | null;
  onSuccess: () => void;
}

export function ClientForm({ open, onOpenChange, clientToEdit, onSuccess }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "", email: "", phone: "", address: "",
      gstin: "", pincode: "", state: "", stateCode: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(clientToEdit ? {
        name: clientToEdit.name,
        email: clientToEdit.email || "",
        phone: clientToEdit.phone || "",
        address: clientToEdit.address || "",
        gstin: clientToEdit.gstin || "",
        pincode: clientToEdit.pincode || "",
        state: clientToEdit.state || "",
        stateCode: clientToEdit.stateCode || "",
      } : {
        name: "", email: "", phone: "", address: "",
        gstin: "", pincode: "", state: "", stateCode: "",
      });
    }
  }, [open, clientToEdit, form]);

  const handleStateChange = (stateName: string) => {
    form.setValue("state", stateName);
    const found = INDIAN_STATES.find(s => s.name === stateName);
    if (found) {
      form.setValue("stateCode", found.code);
    }
  };

  // 👇 Reverted to Simple Toast Logic
  const onSubmit = async (values: ClientFormValues) => {
    try {
      if (clientToEdit) {
        await clientService.update(clientToEdit.id, values as any);
        toast.success("Client updated");
      } else {
        await clientService.create(values as any);
        toast.success("Client created");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save client");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{clientToEdit ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="col-span-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Client / Company Name *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input className="pl-9" placeholder="JMD DÉCOR" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Phone */}
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input className="pl-9" placeholder="+91 9876543210" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Email */}
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input className="pl-9" placeholder="email@example.com" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Address */}
            <div className="col-span-2">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                      <Textarea className="pl-9 min-h-[80px]" placeholder="Shop No 1, Main Road..." {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* GSTIN */}
            <FormField control={form.control} name="gstin" render={({ field }) => (
              <FormItem>
                <FormLabel>GSTIN</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input className="pl-9" placeholder="27AAOPY..." {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Pincode */}
            <FormField control={form.control} name="pincode" render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input className="pl-9" maxLength={6} placeholder="400001" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* State Dropdown */}
            <FormField control={form.control} name="state" render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={handleStateChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="pl-9 relative">
                        <Map className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* State Code */}
            <FormField control={form.control} name="stateCode" render={({ field }) => (
              <FormItem>
                <FormLabel>State Code</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-100" placeholder="--" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="col-span-2 mt-4 pt-2 border-t">
              <Button type="submit" className="w-full">
                {clientToEdit ? "Update Client" : "Create Client"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}