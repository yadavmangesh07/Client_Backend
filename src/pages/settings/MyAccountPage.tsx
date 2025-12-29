import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserCog, Save, Lock, LogOut, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 👇 Added for redirection

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"; // 👇 Imported Dialog components

import { authService } from "@/services/authService";

// Validation Schema
const profileUpdateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false;
  }
  return true;
}, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});

export default function MyAccountPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // 👇 State for Custom Confirmation Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    }
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
        form.setValue("username", user.username);
    }
  }, []);

  // 1. First step: Validate form and open confirmation modal
  const onSubmit = (values: any) => {
    setPendingValues(values);
    setIsConfirmOpen(true);
  };

  // 2. Second step: Execute update after user confirms in Modal
  const handleConfirmUpdate = async () => {
    if (!pendingValues) return;
    
    setIsLoading(true);
    setIsConfirmOpen(false); // Close modal

    try {
      await authService.updateCurrentUser({
          username: pendingValues.username,
          currentPassword: pendingValues.currentPassword,
          newPassword: pendingValues.newPassword || undefined
      });
      
      toast.success("Credentials updated! Logging out...");
      
      // 👇 Logout Logic
      setTimeout(() => {
          authService.logout();
          navigate("/login"); 
          // Optional: Force reload to clear all states
          // window.location.href = "/login"; 
      }, 1500);
      
    } catch (err: any) {
        console.error(err);
        const errorData = err.response?.data;
        const msg = typeof errorData === 'string' 
            ? errorData 
            : errorData?.message || "Failed to update account";
            
        toast.error(msg);
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground">Manage your personal login credentials.</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                <CardTitle>Account Security</CardTitle>
            </div>
            <CardDescription>Update your username or password.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    
                    <FormField control={form.control} name="username" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Lock className="h-4 w-4" /> Change Password
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="newPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="Leave empty to keep current" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="confirmNewPassword" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="Confirm new password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-6">
                        <FormField control={form.control} name="currentPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-amber-900 font-semibold">Current Password (Required to Save)</FormLabel>
                                <FormControl><Input type="password" placeholder="Enter your current password" {...field} className="bg-white" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Validating..." : <><Save className="mr-2 h-4 w-4" /> Update Credentials</>}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>

      {/* 👇 Custom Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" /> Confirm Update
                </DialogTitle>
                <DialogDescription className="pt-2">
                    Changing your username or password will invalidate your current session.
                    <br/><br/>
                    <strong>You will be logged out immediately.</strong> Do you want to proceed?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                <Button variant="default" onClick={handleConfirmUpdate}>
                    <LogOut className="mr-2 h-4 w-4" /> Yes, Update & Logout
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}