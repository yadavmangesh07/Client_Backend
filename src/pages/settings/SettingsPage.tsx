import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Building2, Landmark, Image as ImageIcon, UserPlus, Trash2, ShieldAlert } from "lucide-react"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"; 

import { companyService } from "@/services/companyService";
import { authService, type User } from "@/services/authService";

import { PasswordConfirmDialog } from "@/components/common/PasswordConfirmDialog";

// 1. Schema
const companySchema = z.object({
  id: z.string().optional().nullable(),
  companyName: z.string().min(1, "Company Name is required"),
  address: z.string().min(1, "Address is required"),
  pincode: z.string().min(6, "Valid 6-digit Pincode required").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().or(z.literal("")).nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  secondaryEmail: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  secondaryPhone: z.string().optional().or(z.literal("")).nullable(),
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

type PendingAction = 
  | { type: 'SAVE_PROFILE'; payload: CompanyFormValues }
  | { type: 'DELETE_USER'; payload: { id: string; username: string } };

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "USER" });
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "", address: "", pincode: "", phone: "", email: "", 
      secondaryEmail: "", secondaryPhone: "", 
      website: "", gstin: "", udyamRegNo: "", bankName: "", accountName: "", accountNumber: "", 
      ifscCode: "", branch: "", logoUrl: "", signatureUrl: ""
    }
  });

  useEffect(() => {
    const user = authService.getCurrentUser(); 
    setCurrentUser(user);
    loadProfile();
    if (user?.role === 'ADMIN') {
        loadUsers();
    }
  }, []);

  const loadProfile = async () => {
    try {
      const data = await companyService.getProfile();
      if (data) {
        form.reset({
           ...data,
           id: data.id || null, 
           secondaryEmail: data.secondaryEmail || "",
           secondaryPhone: data.secondaryPhone || "",
           logoUrl: data.logoUrl || "",
           signatureUrl: data.signatureUrl || ""
        });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const loadUsers = async () => {
      try {
          const data = await authService.getAllUsers();
          setUsers(data);
      } catch (error) {
          console.error("Failed to load users");
      }
  };

  const onFormSubmit = (values: CompanyFormValues) => {
    setPendingAction({ type: 'SAVE_PROFILE', payload: values });
    setIsConfirmOpen(true);
  };

  // 👇 UPDATED: Accepts event 'e' to stop default form submission
  const onDeleteClick = (e: React.MouseEvent, id: string, username: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to remove access for ${username}?`)) return;
    setPendingAction({ type: 'DELETE_USER', payload: { id, username } });
    setIsConfirmOpen(true);
  };

  const handleSecurityCheckPassed = async () => {
    if (!pendingAction) return;

    setIsLoading(true);
    try {
      if (pendingAction.type === 'SAVE_PROFILE') {
        await companyService.saveProfile(pendingAction.payload as any); 
        toast.success("Settings saved successfully!");
      } 
      else if (pendingAction.type === 'DELETE_USER') {
        await authService.deleteUser(pendingAction.payload.id);
        toast.success(`User '${pendingAction.payload.username}' deleted.`);
        loadUsers(); 
      }
    } catch (error) {
      console.error(error);
      toast.error("Operation failed.");
    } finally {
      setIsLoading(false);
      setPendingAction(null); 
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
        const msg = err.response?.data?.message || "Failed to add user";
        toast.error(msg);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company profile and configurations.</p>
      </div>

      {/* 👇 REMOVED OUTER FORM TAG HERE - Split into specific tabs */}
      
      <Tabs defaultValue="general" className="w-full">
        
        <TabsList className={cn("grid w-full", isAdmin ? "grid-cols-4" : "grid-cols-3")}>
          <TabsTrigger value="general"><Building2 className="w-4 h-4 mr-2"/> General</TabsTrigger>
          <TabsTrigger value="bank"><Landmark className="w-4 h-4 mr-2"/> Bank</TabsTrigger>
          <TabsTrigger value="branding"><ImageIcon className="w-4 h-4 mr-2"/> Branding</TabsTrigger>
          {isAdmin && <TabsTrigger value="team"><UserPlus className="w-4 h-4 mr-2"/> Team</TabsTrigger>}
        </TabsList>

        {/* --- TAB 1: GENERAL --- */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                {isAdmin ? "Update your invoice header details." : "View company invoice details (Read Only)."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 👇 ADDED Form wrapper here for General inputs */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Company Name</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="JMD Décor" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="contact@jmd.com" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="+91 98..." {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="secondaryEmail" render={({ field }) => (
                      <FormItem><FormLabel>Secondary Email</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="alt@jmd.com" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="secondaryPhone" render={({ field }) => (
                      <FormItem><FormLabel>Secondary Phone</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="+91 98..." {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Full Address</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="Shop No 5..." {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <Separator className="col-span-2 my-2"/>
                    <FormField control={form.control} name="gstin" render={({ field }) => (
                        <FormItem><FormLabel>GSTIN</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="27ABC..." {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="pincode" render={({ field }) => (
                        <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="400064" maxLength={6} {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="udyamRegNo" render={({ field }) => (
                          <FormItem><FormLabel>Udyam Reg No</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="MH-19-..." {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="website" render={({ field }) => (
                          <FormItem><FormLabel>Website</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="www.jmddecor.com" {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                  </div>
                  {isAdmin && <div className="flex justify-end pt-4"><Button type="submit" disabled={isLoading}>{isLoading ? "Verifying..." : <><Save className="mr-2 h-4 w-4"/> Save Company Profile</>}</Button></div>}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: BANK --- */}
        <TabsContent value="bank">
          <Card>
            <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* 👇 ADDED Form wrapper here for Bank inputs */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="bankName" render={({ field }) => (
                      <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="Kotak Mahindra Bank" {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="branch" render={({ field }) => (
                      <FormItem><FormLabel>Branch</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="Jawahar Nagar" {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="accountName" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Account Name</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="JMD DÉCOR" {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="accountNumber" render={({ field }) => (
                      <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="1234567890" {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="ifscCode" render={({ field }) => (
                      <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="KKBK000..." {...field} value={field.value || ""} /></FormControl></FormItem>
                    )} />
                  </div>
                  {isAdmin && <div className="flex justify-end pt-4"><Button type="submit" disabled={isLoading}>{isLoading ? "Verifying..." : <><Save className="mr-2 h-4 w-4"/> Save Bank Details</>}</Button></div>}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: BRANDING --- */}
        <TabsContent value="branding">
          <Card>
            <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* 👇 ADDED Form wrapper here for Branding inputs */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="logoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl><Input disabled={!isAdmin} placeholder="/logo.png" {...field} value={field.value || ""} /></FormControl>
                        <p className="text-xs text-muted-foreground">Path to image in public folder</p>
                      </FormItem>
                    )} />
                    <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-gray-50 h-32">
                        <span className="text-xs text-gray-400 mb-2">Logo Preview</span>
                        {form.watch("logoUrl") ? <img src={form.watch("logoUrl") || ""} alt="Logo" className="h-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')}/> : <ImageIcon className="h-8 w-8 text-gray-300" />}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="signatureUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature URL</FormLabel>
                        <FormControl><Input disabled={!isAdmin} placeholder="/signature.png" {...field} value={field.value || ""} /></FormControl>
                      </FormItem>
                    )} />
                     <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-gray-50 h-32">
                        <span className="text-xs text-gray-400 mb-2">Signature Preview</span>
                        {form.watch("signatureUrl") ? <img src={form.watch("signatureUrl") || ""} alt="Sig" className="h-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <div className="text-gray-300 text-xs italic">No Signature</div>}
                    </div>
                  </div>
                  {isAdmin && <div className="flex justify-end pt-4"><Button type="submit" disabled={isLoading}>{isLoading ? "Verifying..." : <><Save className="mr-2 h-4 w-4"/> Save Branding</>}</Button></div>}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 4: TEAM ACCESS (ADMIN ONLY) --- */}
        {isAdmin && (
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                    <CardTitle>Team Management</CardTitle>
                </div>
                <CardDescription>Create new users or remove existing access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* ⚠️ NO <FORM> TAG HERE to prevent nested submissions */}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
                  <div className="col-span-2 font-medium text-sm text-gray-700">Add New User</div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Username</label>
                    <Input placeholder="new_user" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Password</label>
                    <Input type="password" placeholder="******" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
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
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.role}
                                      </span>
                                  </div>
                              </div>
                              
                              {/* 👇 FIXED: type='button' and updated handler */}
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => onDeleteClick(e, user.id!, user.username)} 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>

      <PasswordConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirmed={handleSecurityCheckPassed}
        title="Security Confirmation"
        description={
          pendingAction?.type === 'DELETE_USER' 
          ? `Please enter your password to confirm deleting user '${pendingAction.payload.username}'.`
          : "Please enter your password to save company profile changes."
        }
      />
    </div>
  );
}