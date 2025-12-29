import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Calendar, MapPin, Hash, Phone, Mail, Building2, FolderOpen, AlertTriangle} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Services & Types
import { clientService } from "@/services/clientService";
import type { Client } from "@/types";
import { ClientForm } from "@/features/clients/ClientForm";

export default function ClientPage() {
  const navigate = useNavigate(); 
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // View Details State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // 👇 Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // 👇 Step 1: Open Dialog
  const initiateDelete = (id: string) => {
    setDeleteId(id);
  };

  // 👇 Step 2: Confirm Delete with Rich Toast
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await clientService.delete(deleteId);
      
     
      toast.success("Client Deleted");
      
      loadClients();
    } catch (error) {
      toast.error("Failed to delete client");
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleView = (client: Client) => {
    setViewingClient(client);
    setIsViewOpen(true);
  };

  const handleManageProjects = (client: Client) => {
    navigate(`/files/${client.id}`);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your customer database.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
                placeholder="Search clients..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading clients...</TableCell></TableRow>
            ) : filteredClients.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No clients found.</TableCell></TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{client.name}</span>
                            <span className="text-xs text-gray-500">{client.phone || client.email || "No contact info"}</span>
                        </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {client.createdAt ? format(new Date(client.createdAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  
                  <TableCell className="text-sm text-gray-500">
                    {client.updatedAt ? format(new Date(client.updatedAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        <DropdownMenuItem onClick={() => handleView(client)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleManageProjects(client)}>
                            <FolderOpen className="mr-2 h-4 w-4" /> Documents & Projects
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        
                        {/* 👇 UPDATED: Uses initiateDelete instead of handleDelete */}
                        <DropdownMenuItem onClick={() => initiateDelete(client.id!)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClientForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        clientToEdit={editingClient}
        onSuccess={loadClients}
      />

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {viewingClient?.name.substring(0, 2).toUpperCase()}
                </div>
                {viewingClient?.name}
            </DialogTitle>
          </DialogHeader>

          {viewingClient && (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3"/> Phone</span>
                        <p className="text-sm font-medium">{viewingClient.phone || "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3"/> Email</span>
                        <p className="text-sm font-medium truncate">{viewingClient.email || "-"}</p>
                    </div>
                </div>

                <div className="space-y-1 bg-gray-50 p-3 rounded-md">
                     <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><Building2 className="h-3 w-3"/> GSTIN</span>
                     <p className="text-sm font-mono tracking-wide">{viewingClient.gstin || "Unregistered"}</p>
                </div>

                <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Billing Address</span>
                    <p className="text-sm leading-relaxed text-gray-700">{viewingClient.address || "-"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500">State</span>
                        <p className="text-sm">{viewingClient.state || "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><Hash className="h-3 w-3"/> Pincode</span>
                        <p className="text-sm">{viewingClient.pincode || "-"}</p>
                    </div>
                </div>

                <div className="border-t pt-3 mt-2 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3"/> Added On</span>
                        <p className="text-xs text-gray-500">{viewingClient.createdAt ? format(new Date(viewingClient.createdAt), 'PPpp') : '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3"/> Last Updated</span>
                        <p className="text-xs text-gray-500">{viewingClient.updatedAt ? format(new Date(viewingClient.updatedAt), 'PPpp') : '-'}</p>
                    </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 👇 DELETE CONFIRMATION DIALOG (Was missing in your snippet) */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}