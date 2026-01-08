import type { UseFormReturn } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form";

interface BankTabProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export function BankTab({ form, onSubmit, isAdmin, isLoading }: BankTabProps) {
  return (
    <Card className="w-full border shadow-sm">
      <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField control={form.control} name="bankName" render={({ field }) => (
                <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="Kotak Mahindra Bank" {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              
              <FormField control={form.control} name="branch" render={({ field }) => (
                <FormItem><FormLabel>Branch</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="Jawahar Nagar" {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              
              {/* Full width row for Account Name */}
              <FormField control={form.control} name="accountName" render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2"><FormLabel>Account Name</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="JMD DÉCOR" {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              
              <FormField control={form.control} name="accountNumber" render={({ field }) => (
                <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="1234567890" {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              
              <FormField control={form.control} name="ifscCode" render={({ field }) => (
                <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input disabled={!isAdmin} placeholder="KKBK000..." {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
            </div>
            
            {isAdmin && (
                <div className="flex justify-end pt-6">
                    <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                        {isLoading ? "Verifying..." : <><Save className="mr-2 h-4 w-4"/> Save Bank Details</>}
                    </Button>
                </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}