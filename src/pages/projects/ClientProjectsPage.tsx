import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 👈 For URL params
import { Plus, Trash2, FileText, Image as ImageIcon, ExternalLink, Loader2, ArrowLeft, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import apiClient from "@/lib/axios"; 

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Services
//import { clientService } from "@/services/clientService"; // Ensure you have getById or use apiClient

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

export default function ClientProjectsPage() {
    const { clientId } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    
    const [clientName, setClientName] = useState("Loading...");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState("");

    // 1. Load Client Info & Projects
    useEffect(() => {
        const init = async () => {
            if (!clientId) return;
            setLoading(true);
            try {
                // A. Fetch Client Name
                // If clientService.getById(clientId) exists, use it. Otherwise use apiClient:
                const clientRes = await apiClient.get(`/clients/${clientId}`); 
                setClientName(clientRes.data.name);

                // B. Fetch Projects
                const projectRes = await apiClient.get(`/projects/client/${clientId}`);
                setProjects(projectRes.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [clientId]);

    // 2. Load Projects Only (For Refreshing)
    const loadProjects = async () => {
        if (!clientId) return;
        try {
            const res = await apiClient.get(`/projects/client/${clientId}`);
            setProjects(res.data);
        } catch (error) { console.error(error); }
    };

    // 3. Create Project
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

    // 4. Upload File
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
                method: "POST", body: formData
            });
            const cloudData = await cloudRes.json();
            if (cloudData.error) throw new Error(cloudData.error.message);

            // B. Save to Backend
            const newDoc = {
                name: file.name,
                url: cloudData.secure_url,
                type: file.type
            };
            await apiClient.post(`/projects/${projectId}/documents`, newDoc);
            
            toast.success("File uploaded!", { id: toastId });
            loadProjects(); 
        } catch (error) {
            console.error(error);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleEmailDoc = (doc: ProjectDocument) => {
        navigator.clipboard.writeText(doc.url);
        toast.success("Link copied! (Ready to paste in email)");
    };

    const handleDeleteDoc = async (projectId: string, fileId: string) => {
        if(!confirm("Delete this file?")) return;
        try {
            await apiClient.delete(`/projects/${projectId}/documents/${fileId}`);
            toast.success("File removed");
            loadProjects();
        } catch(e) { toast.error("Failed to delete"); }
    };

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex flex-col gap-2">
                <Button 
                    variant="ghost" 
                    className="w-fit pl-0 hover:bg-transparent hover:text-blue-600" 
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Files
                </Button>
                
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <FolderOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{clientName}</h1>
                        <p className="text-muted-foreground">Manage projects, designs, and documents.</p>
                    </div>
                </div>
            </div>

            {/* Create Project Section */}
            <Card className="bg-white">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Create New Project</label>
                            <Input 
                                placeholder="e.g. Kitchen Renovation 2025" 
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreateProject} disabled={!newProjectTitle || loading} className="min-w-[140px]">
                            <Plus className="mr-2 h-4 w-4" /> Create Project
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Projects Grid */}
            {loading ? (
                <div className="py-20 text-center text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed rounded-xl bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                    <p className="text-gray-500">Create a project above to start uploading files.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {projects.map((proj) => (
                        <Card key={proj.id} className="overflow-hidden shadow-sm border-gray-200">
                            <CardHeader className="bg-gray-50/80 border-b py-3 px-6 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg font-semibold text-gray-800">{proj.title}</CardTitle>
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                                        {proj.status}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Created: {format(new Date(proj.createdAt), 'MMM dd, yyyy')}
                                </span>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                                {/* Files List */}
                                <div className="space-y-3 mb-6">
                                    {proj.documents.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-sm italic bg-gray-50/50 rounded-lg border border-dashed">
                                            No documents uploaded yet.
                                        </div>
                                    )}
                                    {proj.documents.map(doc => (
                                        <div key={doc.fileId} className="group flex items-center justify-between p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50/30 transition-all bg-white">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                {/* Thumbnail */}
                                                {doc.type.includes("image") ? (
                                                    <div className="h-12 w-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 border">
                                                        <img src={doc.url} alt="thumb" className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 bg-red-50 text-red-500 rounded-md flex items-center justify-center flex-shrink-0 border border-red-100">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                )}
                                                
                                                {/* Info */}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                                    <a 
                                                        href={doc.url} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                                    >
                                                        View Full Size <ExternalLink className="h-3 w-3"/>
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="outline" size="sm" onClick={() => handleEmailDoc(doc)} title="Copy Link">
                                                    <ExternalLink className="h-4 w-4 text-gray-500" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDeleteDoc(proj.id, doc.fileId)} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Upload Area */}
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => handleFileUpload(e, proj.id)}
                                        disabled={uploading}
                                    />
                                    <div className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-2 transition-colors ${uploading ? 'bg-gray-50' : 'hover:bg-gray-50 border-gray-300 hover:border-blue-400'}`}>
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-600"/>
                                                <span className="text-sm text-gray-600 font-medium">Uploading to Cloud...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="h-5 w-5 text-gray-400"/>
                                                <span className="text-sm text-gray-600 font-medium">Click to Upload Document or Image</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}