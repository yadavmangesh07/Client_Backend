import type { UseFormReturn } from "react-hook-form";
import { Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

interface BrandingTabProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export function BrandingTab({ form, onSubmit, isAdmin, isLoading }: BrandingTabProps) {
  return (
    <Card className="w-full border shadow-sm">
      <CardHeader>
        <CardTitle>Branding & Identity</CardTitle>
        <CardDescription>Upload your company logo and authorized signature for documents.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* ROW 1: LOGO SECTION (Grid: Input Left | Preview Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                  <FormField control={form.control} name="logoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo URL</FormLabel>
                      <FormControl>
                        <Input disabled={!isAdmin} placeholder="/logo.png" {...field} value={field.value || ""} />
                      </FormControl>
                      <p className="text-[13px] text-muted-foreground">
                        Enter the public path or URL for your company logo (e.g., <code>/images/logo.png</code>).
                      </p>
                    </FormItem>
                  )} />
              </div>
              
              {/* Logo Preview Box */}
              <div className="lg:col-span-1">
                  <span className="text-sm font-medium mb-2 block text-gray-700">Preview</span>
                  <div className="border rounded-lg p-4 flex items-center justify-center bg-gray-50/50 h-32 border-dashed">
                      {form.watch("logoUrl") ? (
                        <img 
                          src={form.watch("logoUrl") || ""} 
                          alt="Logo Preview" 
                          className="h-full max-w-full object-contain" 
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        /> 
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 gap-1">
                           <ImageIcon className="h-8 w-8 opacity-50" />
                           <span className="text-xs">No image</span>
                        </div>
                      )}
                  </div>
              </div>
            </div>

            <Separator />

            {/* ROW 2: SIGNATURE SECTION (Grid: Input Left | Preview Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                  <FormField control={form.control} name="signatureUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authorized Signature URL</FormLabel>
                      <FormControl>
                        <Input disabled={!isAdmin} placeholder="/signature.png" {...field} value={field.value || ""} />
                      </FormControl>
                      <p className="text-[13px] text-muted-foreground">
                        Enter the path for the digital signature to appear on invoices.
                      </p>
                    </FormItem>
                  )} />
              </div>

              {/* Signature Preview Box */}
              <div className="lg:col-span-1">
                  <span className="text-sm font-medium mb-2 block text-gray-700">Preview</span>
                  <div className="border rounded-lg p-4 flex items-center justify-center bg-gray-50/50 h-32 border-dashed">
                      {form.watch("signatureUrl") ? (
                        <img 
                          src={form.watch("signatureUrl") || ""} 
                          alt="Signature Preview" 
                          className="h-full max-w-full object-contain" 
                          onError={(e) => (e.currentTarget.style.display = 'none')} 
                        /> 
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 gap-1">
                           <ImageIcon className="h-8 w-8 opacity-50" />
                           <span className="text-xs">No image</span>
                        </div>
                      )}
                  </div>
              </div>
            </div>

            {isAdmin && (
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                        {isLoading ? "Verifying..." : <><Save className="mr-2 h-4 w-4"/> Save Branding</>}
                    </Button>
                </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}