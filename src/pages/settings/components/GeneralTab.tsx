import type { UseFormReturn } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

interface GeneralTabProps {
  form: UseFormReturn<any>; 
  onSubmit: (values: any) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export function GeneralTab({ form, onSubmit, isAdmin, isLoading }: GeneralTabProps) {
  return (
    <Card className="w-full border shadow-sm">
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          {isAdmin ? "Update your invoice header details." : "View company invoice details (Read Only)."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ROW 1 */}
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                   <FormLabel>Company Name</FormLabel>
                   <FormControl><Input disabled={!isAdmin} placeholder="JMD Décor" {...field} value={field.value || ""} /></FormControl>
                   <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem>
                       <FormLabel>Website</FormLabel>
                       <FormControl><Input disabled={!isAdmin} placeholder="www.jmddecor.com" {...field} value={field.value || ""} /></FormControl>
                    </FormItem>
              )} />
              
              {/* ROW 2 */}
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="contact@jmd.com" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="+91 98..." {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              
              <FormField control={form.control} name="secondaryEmail" render={({ field }) => (
                <FormItem><FormLabel>Secondary Email</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="alt@jmd.com" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />

              {/* ROW 3 */}
              <FormField control={form.control} name="secondaryPhone" render={({ field }) => (
                <FormItem><FormLabel>Secondary Phone</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="+91 98..." {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                   <FormLabel>Full Address</FormLabel>
                   <FormControl><Input disabled={!isAdmin} placeholder="Shop No 5..." {...field} value={field.value || ""} /></FormControl>
                </FormItem>
              )} />
              
              <Separator className="col-span-1 md:col-span-3 my-2"/>
              
              {/* ROW 4 */}
              <FormField control={form.control} name="gstin" render={({ field }) => (
                  <FormItem><FormLabel>GSTIN</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="27ABC..." {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              
              <FormField control={form.control} name="pincode" render={({ field }) => (
                  <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="400064" maxLength={6} {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="udyamRegNo" render={({ field }) => (
                    <FormItem><FormLabel>Udyam Reg No</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="MH-19-..." {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
            </div>
            
            {isAdmin && (
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                        {isLoading ? "Verifying..." : <><Save className="mr-2 h-4 w-4"/> Save Profile</>}
                    </Button>
                </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}