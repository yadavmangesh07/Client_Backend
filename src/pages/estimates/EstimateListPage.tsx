import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { format, isValid } from "date-fns"; 
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { estimateService } from "@/services/estimateService";
import { clientService } from "@/services/clientService"; 
// 👇 Ensure this points to your index types
import type { Estimate } from "@/types"; 

export default function EstimateListPage() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [estData, clientData] = await Promise.all([
          estimateService.getAll(),
          clientService.getAll()
      ]);
      setEstimates(Array.isArray(estData) ? estData : []);
      
      let loadedClients: any[] = [];
      if(Array.isArray(clientData)) loadedClients = clientData;
      else if(clientData?.content) loadedClients = clientData.content;
      setClients(loadedClients);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this estimate?")) return;
      try {
          await estimateService.delete(id);
          toast.success("Estimate deleted");
          loadData();
      } catch(e) { toast.error("Failed to delete"); }
  };

  const handleDownload = async (id: string, estNo: string) => {
      try {
          toast.info("Downloading PDF...");
          const blob = await estimateService.downloadPdf(id);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `Estimate_${estNo || "doc"}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch(e) { toast.error("Failed to download PDF"); }
  };

  const getClientName = (id: string) => {
      if (!clients || clients.length === 0) return "Unknown";
      const c = clients.find(cl => cl.id === id);
      return c?.name || "Unknown";
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'APPROVED': return "bg-green-100 text-green-700 border-green-200";
          case 'SENT': return "bg-blue-100 text-blue-700 border-blue-200";
          case 'REJECTED': return "bg-red-100 text-red-700 border-red-200";
          default: return "bg-slate-100 text-slate-700 border-slate-200";
      }
  };

  const formatDateSafe = (dateString: any) => {
      if (!dateString) return "-";
      try {
          const date = new Date(dateString);
          return isValid(date) ? format(date, "dd MMM yyyy") : "Invalid Date";
      } catch (e) {
          return "-";
      }
  };

  const filtered = estimates.filter(e => 
      (e.estimateNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (getClientName(e.clientId) || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">Manage quotations and project estimates.</p>
        </div>
        <Button onClick={() => navigate("/estimates/new")}>
            <Plus className="mr-2 h-4 w-4" /> Create Estimate
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Estimates</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Client or Est No..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Est No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No estimates found.</TableCell></TableRow>
              ) : (
                filtered.map((est) => (
                  <TableRow key={est.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        {est.estimateNo || "N/A"}
                    </TableCell>
                    <TableCell>{formatDateSafe(est.estimateDate)}</TableCell>
                    <TableCell>{getClientName(est.clientId)}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn("capitalize", getStatusColor(est.status || "DRAFT"))}>
                            {(est.status || "DRAFT").toLowerCase()}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">₹{(est.total || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownload(est.id, est.estimateNo)}>
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/estimates/${est.id}/edit`)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(est.id)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}