import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, User, Building2, Map } from "lucide-react";

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

import { clientService } from "@/services/clientService";
import type { Client } from "@/types";

// --- INDIAN STATE CODES (GST) ---
const INDIAN_STATES = [
  { name: "Jammu and Kashmir", code: "01" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Punjab", code: "03" },
  { name: "Chandigarh", code: "04" },
  { name: "Uttarakhand", code: "05" },
  { name: "Haryana", code: "06" },
  { name: "Delhi", code: "07" },
  { name: "Rajasthan", code: "08" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Bihar", code: "10" },
  { name: "Sikkim", code: "11" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Nagaland", code: "13" },
  { name: "Manipur", code: "14" },
  { name: "Mizoram", code: "15" },
  { name: "Tripura", code: "16" },
  { name: "Meghalaya", code: "17" },
  { name: "Assam", code: "18" },
  { name: "West Bengal", code: "19" },
  { name: "Jharkhand", code: "20" },
  { name: "Odisha", code: "21" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Gujarat", code: "24" },
  { name: "Maharashtra", code: "27" },
  { name: "Karnataka", code: "29" },
  { name: "Goa", code: "30" },
  { name: "Kerala", code: "32" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Andhra Pradesh", code: "37" },
];

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  state: z.string().optional(),
  stateCode: z.string().optional(),
});

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientToEdit?: Client | null;
  onSuccess: () => void;
}

export function ClientForm({ open, onOpenChange, clientToEdit, onSuccess }: ClientFormProps) {
  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "", email: "", phone: "", address: "",
      gstin: "", state: "", stateCode: "",
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
        state: clientToEdit.state || "",
        stateCode: clientToEdit.stateCode || "",
      } : {
        name: "", email: "", phone: "", address: "",
        gstin: "", state: "", stateCode: "",
      });
    }
  }, [open, clientToEdit, form]);

  // 👇 Handler: When State changes, auto-fill State Code
  const handleStateChange = (stateName: string) => {
    form.setValue("state", stateName);
    const found = INDIAN_STATES.find(s => s.name === stateName);
    if (found) {
      form.setValue("stateCode", found.code);
    }
  };

  const onSubmit = async (values: z.infer<typeof clientSchema>) => {
    try {
      if (clientToEdit) {
        await clientService.update(clientToEdit.id, values);
        toast.success("Client updated");
      } else {
        await clientService.create(values);
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
                  <FormLabel>Client / Company Name</FormLabel>
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

            {/* Address */}
            <div className="col-span-2">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input className="pl-9" placeholder="Shop No 1, Main Road..." {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* GSTIN */}
            <div className="col-span-2">
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
            </div>

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

            {/* State Code (Read Only) */}
            <FormField control={form.control} name="stateCode" render={({ field }) => (
              <FormItem>
                <FormLabel>State Code</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-100" placeholder="Auto-filled" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="col-span-2 mt-4">
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