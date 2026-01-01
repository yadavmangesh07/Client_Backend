import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
//import { Separator } from "@/components/ui/separator";

import { wccService } from "@/services/wccService";
import type { WCCData } from "@/types/wccTypes";

export default function WCCFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);

  // React Hook Form Setup
  const { register, control, handleSubmit, reset, setValue, watch } = useForm<WCCData>({
    defaultValues: {
      certificateDate: format(new Date(), "dd-MM-yyyy"),
      items: [{ srNo: 1, activity: "", qty: "" }],
      companyName: "JMD DECOR"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Load data if editing
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      wccService.getById(id!)
        .then((data) => {
           // Ensure items exist
           if(!data.items || data.items.length === 0) {
               data.items = [{ srNo: 1, activity: "", qty: "" }];
           }
           reset(data);
        })
        .catch(() => {
            toast.error("Failed to load certificate details");
            navigate("/wcc");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate, reset]);

  // Sync Client Name with Store Name if client is empty (Optional helper)
  const storeName = watch("storeName");
  useEffect(() => {
      if (!isEditMode && storeName) {
          setValue("clientName", storeName);
      }
  }, [storeName, isEditMode, setValue]);

  const onSubmit = async (data: WCCData) => {
    try {
      setLoading(true);
      if (isEditMode) {
        await wccService.update(id!, data);
        toast.success("Certificate updated successfully");
      } else {
        await wccService.create(data);
        toast.success("Certificate created successfully");
      }
      navigate("/wcc");
    } catch (error) {
      toast.error(isEditMode ? "Failed to update" : "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/wcc")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Certificate" : "New Work Certificate"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update existing certificate details" : "Create a new completion certificate"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            
            <div className="space-y-2">
                <Label>Store Name (Client)</Label>
                <Input placeholder="e.g. DUA LIMA RETAIL..." {...register("storeName", { required: true })} />
            </div>

            <div className="space-y-2">
                <Label>Ref No.</Label>
                <Input placeholder="e.g. JMD/2024-25/86" {...register("refNo", { required: true })} />
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Project Location</Label>
                <Textarea placeholder="Shop Address..." {...register("projectLocation", { required: true })} />
            </div>

            <div className="space-y-2">
                <Label>Certificate Date</Label>
                <Input placeholder="DD-MM-YYYY" {...register("certificateDate")} />
            </div>

            <div className="space-y-2">
                <Label>GSTIN</Label>
                <Input placeholder="24AAICD..." {...register("gstin")} />
            </div>

            <div className="space-y-2">
                <Label>PO Number</Label>
                <Input placeholder="e.g. 22330" {...register("poNo")} />
            </div>

            <div className="space-y-2">
                <Label>PO Date</Label>
                <Input placeholder="DD-MM-YYYY" {...register("poDate")} />
            </div>
            
            {/* Hidden fields for footer names (defaults) */}
            <input type="hidden" {...register("companyName")} />
            <input type="hidden" {...register("clientName")} />

          </CardContent>
        </Card>

        {/* Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Work Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ srNo: fields.length + 1, activity: "", qty: "" })}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start">
                        <div className="w-[60px]">
                            <Input 
                                placeholder="Sr." 
                                {...register(`items.${index}.srNo`)} 
                                className="text-center"
                            />
                        </div>
                        <div className="flex-1">
                            <Textarea 
                                placeholder="Activity Description..." 
                                {...register(`items.${index}.activity` as const, { required: true })} 
                                rows={2}
                            />
                        </div>
                        <div className="w-[100px]">
                            <Input 
                                placeholder="Qty" 
                                {...register(`items.${index}.qty`)} 
                            />
                        </div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/wcc")}>Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Certificate" : "Create Certificate"}
            </Button>
        </div>

      </form>
    </div>
  );
}