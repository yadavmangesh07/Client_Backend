import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Building2, Landmark, Image as ImageIcon, UserPlus, Trash2 } from "lucide-react"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { companyService } from "@/services/companyService";
import { authService } from "@/services/authService";

// 1. Define Robust Schema (Handles nulls and empty strings)
const companySchema = z.object({
  id: z.string().optional().nullable(), // Allow null ID
  
  companyName: z.string().min(1, "Company Name is required"),
  address: z.string().min(1, "Address is required"),
  
  // Allow string, empty string, or null for optional fields
  phone: z.string().optional().or(z.literal("")).nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  website: z.string().optional().or(z.literal("")).nullable(),
  gstin: z.string().optional().or(z.literal("")).nullable(),
  udyamRegNo: z.string().optional().or(z.literal("")).nullable(),
  
  bankName: z.string().optional().or(z.literal("")).nullable(),
  accountName: z.string().optional().or(z.literal("")).nullable(),
  accountNumber: z.string().optional().or(z.literal("")).nullable(),
  ifscCode: z.string().optional().or(z.literal("")).nullable(),
  branch: z.string().optional().or(z.literal("")).nullable(),
  
  logoUrl: z.string().optional().or(z.literal("")).nullable(),
  signatureUrl: z.string().optional().or(z.literal("")).nullable(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // State for Team Management
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "USER" });
  const [users, setUsers] = useState<any[]>([]);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "", address: "", phone: "", email: "", website: "",
      gstin: "", udyamRegNo: "",
      bankName: "", accountName: "", accountNumber: "", ifscCode: "", branch: "",
      logoUrl: "", signatureUrl: ""
    }
  });

  // Load Users on Mount
  useEffect(() => {
      loadUsers();
  }, []);

  const loadUsers = async () => {
      try {
          const data = await authService.getAllUsers();
          setUsers(data);
      } catch (error) {
          console.error("Failed to load users");
      }
  };

  // Load Company Profile on Mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await companyService.getProfile();
        if (data) {
          form.reset({
             // Fix: Ensure nulls are converted to empty strings for inputs
             id: data.id || null, 
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

  const onSubmit = async (values: CompanyFormValues) => {
    setIsLoading(true);
    try {
      await companyService.saveProfile(values as any); 
      toast.success("Company Profile Saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to remove access for ${username}?`)) return;
    try {
        await authService.deleteUser(id);
        toast.success("User removed");
        loadUsers(); 
    } catch (error) {
        toast.error("Failed to delete user");
    }
  };

  const handleAddUser = async () => {
    if(!newUser.username || !newUser.password) return toast.error("Please fill username and password");
    try {
      await authService.register(newUser.username, newUser.password, newUser.role);
      toast.success(`User '${newUser.username}' created successfully!`);
      setNewUser({ username: "", password: "", role: "USER" }); 
      loadUsers(); 
    } catch (err: any) {
        const msg = err.response?.data || "Failed to add user";
        toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company profile and team access.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general"><Building2 className="w-4 h-4 mr-2"/> General</TabsTrigger>
              <TabsTrigger value="bank"><Landmark className="w-4 h-4 mr-2"/> Bank</TabsTrigger>
              <TabsTrigger value="branding"><ImageIcon className="w-4 h-4 mr-2"/> Branding</TabsTrigger>
              <TabsTrigger value="team"><UserPlus className="w-4 h-4 mr-2"/> Team</TabsTrigger>
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
                        <FormControl><Input placeholder="JMD Décor" {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="contact@jmd.com" {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="+91 9876543210" {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Full Address</FormLabel>
                        <FormControl><Input placeholder="Shop No 5, Goregaon West..." {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />

                    <Separator className="col-span-2 my-2"/>
                    
                    <FormField control={form.control} name="gstin" render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN</FormLabel>
                        <FormControl><Input placeholder="27ABC..." {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="udyamRegNo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Udyam Reg No</FormLabel>
                        <FormControl><Input placeholder="MH-19-..." {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="flex justify-end pt-4">
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4"/> Save Company Profile</>}
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 2: BANK --- */}
            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="bankName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl><Input placeholder="Kotak Mahindra Bank" {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="branch" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl><Input placeholder="Jawahar Nagar" {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="accountName" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Account Name</FormLabel>
                        <FormControl><Input placeholder="JMD DÉCOR" {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="accountNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl><Input placeholder="1234567890" {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="ifscCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl><Input placeholder="KKBK000..." {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="flex justify-end pt-4">
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4"/> Save Bank Details</>}
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 3: BRANDING --- */}
            {/* --- TAB 3: BRANDING (With Preview) --- */}
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* LOGO SECTION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="logoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                            <Input placeholder="/logo.png" {...field} value={field.value || ""} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Path to image in public folder (e.g., /logo.png)</p>
                      </FormItem>
                    )} />

                    {/* Live Preview Box */}
                    <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-gray-50 h-32">
                        <span className="text-xs text-gray-400 mb-2">Logo Preview</span>
                        {form.watch("logoUrl") ? (
                            <img 
                                src={form.watch("logoUrl") || ""} 
                                alt="Logo Preview" 
                                className="h-16 object-contain"
                                onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if broken
                            />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-gray-300" />
                        )}
                    </div>
                  </div>

                  <Separator />

                  {/* SIGNATURE SECTION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="signatureUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature URL</FormLabel>
                        <FormControl>
                            <Input placeholder="/signature.png" {...field} value={field.value || ""} />
                        </FormControl>
                      </FormItem>
                    )} />

                     {/* Live Preview Box */}
                     <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-gray-50 h-32">
                        <span className="text-xs text-gray-400 mb-2">Signature Preview</span>
                        {form.watch("signatureUrl") ? (
                            <img 
                                src={form.watch("signatureUrl") || ""} 
                                alt="Sig Preview" 
                                className="h-16 object-contain"
                                onError={(e) => (e.currentTarget.style.display = 'none')} 
                            />
                        ) : (
                            <div className="text-gray-300 text-xs italic">No Signature</div>
                        )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4"/> Save Branding</>}
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 4: TEAM ACCESS --- */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage who has access to the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Add New User Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
                    <div className="col-span-2 font-medium text-sm text-gray-700">Add New User</div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">Username</label>
                      <Input 
                        placeholder="new_user" 
                        value={newUser.username} 
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">Password</label>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        value={newUser.password} 
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium leading-none">Role</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      >
                        <option value="USER">User (Standard)</option>
                        <option value="ADMIN">Admin (Full Access)</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <Button type="button" onClick={handleAddUser} className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Create Account
                      </Button>
                    </div>
                  </div>

                  {/* Existing Users List */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Existing Users</h3>
                    <div className="border rounded-md divide-y">
                        {users.length === 0 && <div className="p-4 text-center text-gray-500">No users found.</div>}
                        
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        {user.username.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{user.username}</p>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{user.role}</span>
                                    </div>
                                </div>
                                
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id, user.username)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </form>
      </Form>
    </div>
  );
}