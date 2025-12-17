import { useEffect, useState } from "react";
// 👇 NEW: Import toast directly
import { toast } from "sonner"; 
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
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
import { clientService } from "@/services/clientService";
import type { Client, PageResponse } from "@/types";
import { ClientForm } from "@/features/clients/ClientForm";

export default function ClientPage() {
  const [data, setData] = useState<PageResponse<Client> | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientService.search(search, page, 10);
      // ✅ FIX: Use 'response' directly. Do not use 'response.data'
      setData(response); 
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [page, search]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await clientService.delete(id);
      toast.success("Client deleted");
      loadClients();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-8"
            value={search}
            onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
            }}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : !data?.content || data.content.length === 0 ? (
              // 👆 CHANGED: We check if data.content exists explicitly
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No clients found.</TableCell>
              </TableRow>
            ) : (
              // 👇 CHANGED: Added optional chaining (data.content?.map) just in case
              data.content?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(client.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <span className="text-sm">
            Page {data ? data.number + 1 : 1} of {data ? data.totalPages : 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={data ? (page + 1) >= data.totalPages : true}
        >
          Next
        </Button>
      </div>

      <ClientForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        clientToEdit={editingClient}
        onSuccess={loadClients}
      />
    </div>
  );
}