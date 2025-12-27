import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Lock, User, Building2 } from "lucide-react"; // Added Building2
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { authService } from "@/services/authService";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State to track if logo failed to load
  const [logoError, setLogoError] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await authService.login(values);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        
        {/* 👇 UPDATED HEADER SECTION */}
        <CardHeader className="text-center flex flex-col items-center space-y-2">
          
          {!logoError ? (
            // 1. Try showing the Logo
            <div className="h-16 w-full flex items-center justify-center mb-2">
              <img 
                src="/logo.png" 
                alt="Company Logo" 
                className="h-full w-auto object-contain"
                onError={() => setLogoError(true)} // Switch to text if image fails
              />
            </div>
          ) : (
            // 2. Fallback to Text if image missing
            <div className="flex flex-col items-center">
               <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Building2 className="h-6 w-6 text-primary" />
               </div>
               <CardTitle className="text-2xl font-bold">JMD Decor</CardTitle>
            </div>
          )}

          <CardDescription>Login to manage your clients and invoices</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input className="pl-9" placeholder="Enter username" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input type="password" className="pl-9" placeholder="Enter password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}