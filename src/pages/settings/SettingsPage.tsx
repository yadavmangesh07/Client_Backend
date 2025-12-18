import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Building2, Landmark, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { companyService } from "@/services/companyService";

// 1. Define Schema
const companySchema = z.object({
  id: z.string().optional(), // Added ID here to match Interface
  companyName: z.string().min(1, "Company Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  
  gstin: z.string().optional().or(z.literal("")),
  udyamRegNo: z.string().optional().or(z.literal("")),

  bankName: z.string().optional().or(z.literal("")),
  accountName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  ifscCode: z.string().optional().or(z.literal("")),
  branch: z.string().optional().or(z.literal("")),

  logoUrl: z.string().optional().or(z.literal("")),
  signatureUrl: z.string().optional().or(z.literal("")),
});

// 2. Infer Type from Schema
type CompanyFormValues = z.infer<typeof companySchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  // 3. Use the Inferred Type in useForm
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "", address: "", phone: "", email: "", website: "",
      gstin: "", udyamRegNo: "",
      bankName: "", accountName: "", accountNumber: "", ifscCode: "", branch: "",
      logoUrl: "", signatureUrl: ""
    }
  });

  // Load Data on Mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await companyService.getProfile();
        if (data) {
          // Reset form with data, ensuring nulls are converted to empty strings
          form.reset({
             id: data.id,
             companyName: data.companyName || "",
             address: data.address || "",
             phone: data.phone || "",
             email: data.email || "",
             website: data.website || "",
             gstin: data.gstin || "",
             udyamRegNo: data.udyamRegNo || "",
             bankName: data.bankName || "",
             accountName: data.accountName || "",
             accountNumber: data.accountNumber || "",
             ifscCode: data.ifscCode || "",
             branch: data.branch || "",
             logoUrl: data.logoUrl || "",
             signatureUrl: data.signatureUrl || ""
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    loadProfile();
  }, [form]);

  // Save Handler
  const onSubmit = async (values: CompanyFormValues) => {
    setIsLoading(true);
    try {
      // Cast values to the Interface expected by service (handling optional/empty strings)
      await companyService.saveProfile(values as any); 
      toast.success("Company Profile Saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company profile, branding, and bank details.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general"><Building2 className="w-4 h-4 mr-2"/> General Info</TabsTrigger>
              <TabsTrigger value="bank"><Landmark className="w-4 h-4 mr-2"/> Bank Details</TabsTrigger>
              <TabsTrigger value="branding"><ImageIcon className="w-4 h-4 mr-2"/> Branding</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: GENERAL --- */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>This will appear on your invoice header.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input placeholder="JMD Décor" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="contact@jmd.com" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="+91 9876543210" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Full Address</FormLabel>
                        <FormControl><Input placeholder="Shop No 5, Goregaon West..." {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <Separator className="col-span-2 my-2"/>
                    
                    <FormField control={form.control} name="gstin" render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN</FormLabel>
                        <FormControl><Input placeholder="27ABC..." {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="udyamRegNo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Udyam Reg No</FormLabel>
                        <FormControl><Input placeholder="MH-19-..." {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 2: BANK --- */}
            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                  <CardDescription>These details will be shown in the invoice footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="bankName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl><Input placeholder="Kotak Mahindra Bank" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="branch" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl><Input placeholder="Jawahar Nagar" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="accountName" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Account Name</FormLabel>
                        <FormControl><Input placeholder="JMD DÉCOR" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="accountNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl><Input placeholder="1234567890" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="ifscCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl><Input placeholder="KKBK000..." {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 3: BRANDING --- */}
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>Upload your Logo and Signature.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                     <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800 text-sm">
                        ⚠️ <strong>Note:</strong> Image upload will be enabled in the next update. 
                        For now, you can paste image URLs if you have them hosted online.
                     </div>

                    <FormField control={form.control} name="logoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl><Input placeholder="http://localhost:5173/logo.png" {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="signatureUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature URL</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
             <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4"/> Save Settings</>}
             </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}