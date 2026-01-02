import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  FileText, 
  Copy,
  FolderOpen // 👈 Added Folder Icon
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import apiClient from "@/lib/axios";
import { ClientForm } from "@/features/clients/ClientForm";

export default function ClientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get(`/clients/${id}/profile`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load client profile");
      navigate("/clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, navigate]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Reference Number copied!");
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading Client Profile...</div>;
  if (!data) return null;

  const { client, stats, recentInvoices, recentCertificates } = data;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                 {client.gstin ? "GST Registered" : "Unregistered"}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {client.state || "Unknown State"}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           {/* 👇 ADDED: Manage Projects Button (Was missing compared to List View) */}
           <Button variant="outline" onClick={() => navigate(`/files/${client.id}`)}>
             <FolderOpen className="mr-2 h-4 w-4" /> Documents
           </Button>

           <Button variant="outline" onClick={() => setIsEditOpen(true)}>
             <Edit className="mr-2 h-4 w-4" /> Edit Profile
           </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalBilled || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{(stats.pendingAmount || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wccCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invoices Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invoiceCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: CONTACT INFO */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
             <div className="flex items-start gap-3">
               <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
               <div className="break-all">{client.email || "No email"}</div>
             </div>
             <div className="flex items-start gap-3">
               <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
               <div>{client.phone || "No phone"}</div>
             </div>
             <div className="flex items-start gap-3">
               <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
               <div className="leading-relaxed">
                 {client.address}<br/>
                 {client.state} - {client.pincode}
               </div>
             </div>
             <Separator />
             <div>
               <span className="font-semibold block mb-1">GSTIN</span>
               <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{client.gstin || "N/A"}</span>
             </div>
             {client.notes && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-yellow-800 text-xs">
                  <strong>Notes:</strong> {client.notes}
                </div>
             )}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: ACTIVITY TABS */}
        <Card className="md:col-span-2 min-h-[500px]">
          <CardContent className="p-6">
            <Tabs defaultValue="invoices" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
                <TabsTrigger value="wcc">Work Certificates (WCC)</TabsTrigger>
              </TabsList>
              
              {/* INVOICES TAB */}
              <TabsContent value="invoices" className="space-y-4">
                {recentInvoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No invoices found for this client.</p>
                ) : (
                  recentInvoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <FileText className="h-4 w-4 text-primary" />
                           <span className="font-medium">#{inv.invoiceNo}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          {format(new Date(inv.issuedAt), "dd MMM yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                         <div className="font-bold">₹{inv.total.toFixed(2)}</div>
                         <Badge 
                            variant={inv.status === 'PAID' ? 'default' : inv.status === 'PENDING' ? 'destructive' : 'secondary'}
                            className="text-[10px] h-5 px-1.5"
                         >
                           {inv.status}
                         </Badge>
                      </div>
                    </div>
                  ))
                )}
                {recentInvoices.length > 0 && (
                   <Button variant="link" className="w-full" onClick={() => navigate(`/invoices?client=${client.id}`)}>
                     View All Invoices
                   </Button>
                )}
              </TabsContent>

              {/* WCC TAB */}
              <TabsContent value="wcc" className="space-y-4">
                {recentCertificates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                      No work completion certificates found.
                  </p>
                ) : (
                  recentCertificates.map((wcc: any) => (
                    <div key={wcc.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                             <span className="text-xs font-bold text-muted-foreground">#</span>
                          </div>
                          
                          <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                  {/* THE REF NO */}
                                  <span className="font-mono font-medium text-sm">
                                      {wcc.refNo || "No Reference No"}
                                  </span>
                                  
                                  {/* COPY BUTTON */}
                                  {wcc.refNo && (
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                                        onClick={() => handleCopy(wcc.refNo)}
                                        title="Copy to Clipboard"
                                      >
                                          <Copy className="h-3 w-3" />
                                      </Button>
                                  )}
                              </div>
                              {/* Safe Date Rendering */}
                              <p className="text-[10px] text-muted-foreground">
                                {(() => {
                                    try {
                                        if (!wcc.certificateDate) return "";
                                        const dateObj = new Date(wcc.certificateDate);
                                        if (isNaN(dateObj.getTime())) return "";
                                        return format(dateObj, "dd MMM yyyy");
                                    } catch (e) { return ""; }
                                })()}
                              </p>
                          </div>
                       </div>

                       <div className="text-right">
                          <Badge variant="outline" className="text-[10px] px-2">
                             Verified
                          </Badge>
                       </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ClientForm 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        clientToEdit={client}
        onSuccess={() => {
            fetchProfile(); 
        }}
      />

    </div>
  );
}