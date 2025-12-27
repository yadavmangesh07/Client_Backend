import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import apiClient from "@/lib/axios"; // Your axios instance

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 👇 REPLACE WITH YOUR CLOUDINARY DETAILS
const CLOUDINARY_CLOUD_NAME = "df4uwisdy"; 
const CLOUDINARY_PRESET = "billing_app_docs"; 

interface ProjectDocument {
    fileId: string;
    name: string;
    url: string;
    type: string;
}

interface Project {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    documents: ProjectDocument[];
}

interface ProjectManagerProps {
    clientId: string;
    clientName: string;
    open: boolean;
    onOpenChange: (val: boolean) => void;
}

export function ProjectManager({ clientId, clientName, open, onOpenChange }: ProjectManagerProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState("");

    // 1. Load Projects
    const loadProjects = async () => {
        if (!clientId) return;
        setLoading(true);
        try {
            const res = await apiClient.get(`/projects/client/${clientId}`);
            setProjects(res.data);
        } catch (error) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) loadProjects();
    }, [open, clientId]);

    // 2. Create Project
    const handleCreateProject = async () => {
        if (!newProjectTitle.trim()) return;
        try {
            await apiClient.post("/projects", {
                clientId,
                title: newProjectTitle,
                status: "ONGOING"
            });
            toast.success("Project created");
            setNewProjectTitle("");
            loadProjects();
        } catch (error) {
            toast.error("Failed to create project");
        }
    };

    // 3. Upload File to Cloudinary
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Uploading file...");

        try {
            // A. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_PRESET);

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
                method: "POST",
                body: formData
            });
            const cloudData = await cloudRes.json();
            
            if (cloudData.error) throw new Error(cloudData.error.message);

            // B. Save Link to Backend
            const newDoc = {
                name: file.name,
                url: cloudData.secure_url, // The link to the file
                type: file.type
            };

            await apiClient.post(`/projects/${projectId}/documents`, newDoc);
            
            toast.success("File uploaded!", { id: toastId });
            loadProjects(); // Refresh UI
        } catch (error) {
            console.error(error);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    // 4. Send Email (Backend Logic Trigger)
    const handleEmailDoc = async (doc: ProjectDocument) => {
        if(!confirm(`Email ${doc.name} to client?`)) return;
        try {
            // You'll need to create this endpoint in Backend later if you want to attach the file
            // For now, let's just copy link
            navigator.clipboard.writeText(doc.url);
            toast.success("Link copied to clipboard! (Email feature coming soon)");
        } catch(e) { toast.error("Failed"); }
    };

    // 5. Delete Document
    const handleDeleteDoc = async (projectId: string, fileId: string) => {
        if(!confirm("Delete this file?")) return;
        try {
            await apiClient.delete(`/projects/${projectId}/documents/${fileId}`);
            toast.success("File removed");
            loadProjects();
        } catch(e) { toast.error("Failed to delete"); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Projects for {clientName}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Create New Project */}
                    <div className="flex gap-2 items-end border-b pb-4">
                        <div className="w-full max-w-sm">
                            <label className="text-xs font-medium text-gray-500">New Project Title</label>
                            <Input 
                                placeholder="e.g. Kitchen Renovation" 
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreateProject} disabled={!newProjectTitle}>
                            <Plus className="mr-2 h-4 w-4" /> Create Project
                        </Button>
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
                            No projects found. Create one above!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {projects.map((proj) => (
                                <Card key={proj.id} className="bg-gray-50/50">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg">{proj.title}</CardTitle>
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(proj.createdAt), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* File List */}
                                        <div className="space-y-2 mb-4">
                                            {proj.documents.length === 0 && (
                                                <p className="text-xs text-gray-400 italic">No files yet.</p>
                                            )}
                                            {proj.documents.map(doc => (
                                                <div key={doc.fileId} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {doc.type.includes("image") ? (
                                                            <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                                <img src={doc.url} alt="thumbnail" className="h-full w-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 w-10 bg-blue-50 text-blue-500 rounded flex items-center justify-center flex-shrink-0">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                                View <ExternalLink className="h-3 w-3"/>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEmailDoc(doc)} title="Email Link">
                                                            <ExternalLink className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDoc(proj.id, doc.fileId)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Upload Button */}
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileUpload(e, proj.id)}
                                                disabled={uploading}
                                            />
                                            <Button variant="outline" className="w-full border-dashed" disabled={uploading}>
                                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ImageIcon className="mr-2 h-4 w-4"/>}
                                                {uploading ? "Uploading..." : "Upload Document / Image"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}