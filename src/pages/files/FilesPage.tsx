import { useEffect, useState } from "react";
import { Search, Folder } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// UI Components
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
//import { Button } from "@/components/ui/button";

// Services & Components
import { clientService } from "@/services/clientService";
import { ProjectManager } from "@/features/projects/ProjectManager";
import type { Client } from "@/types";

export default function FilesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // State to open the Project Manager
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string} | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolder = (client: Client) => {
    navigate(`/files/${client.id}`);
    setSelectedClient({ id: client.id, name: client.name });
    setIsManagerOpen(true);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Files & Folders</h1>
        <p className="text-muted-foreground">Central repository for all client documents and designs.</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
                placeholder="Search folder by client name..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Folders Grid */}
      {loading ? (
          <div className="text-gray-500">Loading folders...</div>
      ) : filteredClients.length === 0 ? (
          <div className="text-gray-400 italic">No client folders found.</div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredClients.map((client) => (
              <Card 
                key={client.id} 
                className="hover:bg-blue-50 cursor-pointer transition-colors border-none shadow-sm bg-white"
                onClick={() => handleOpenFolder(client)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    {/* Folder Icon */}
                    <div className="h-16 w-16 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center">
                        <Folder className="h-8 w-8 fill-current" />
                    </div>
                    
                    {/* Folder Name */}
                    <div className="w-full">
                        <h3 className="font-semibold text-gray-700 truncate" title={client.name}>
                            {client.name}
                        </h3>
                        <p className="text-xs text-gray-400">Click to view files</p>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
      )}

      {/* The Actual Project Manager (Popup) */}
      {selectedClient && (
        <ProjectManager 
            open={isManagerOpen} 
            onOpenChange={setIsManagerOpen}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
        />
      )}
    </div>
  );
}