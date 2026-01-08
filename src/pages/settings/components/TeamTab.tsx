import { useState } from "react";
// 👇 FIX: Rename 'User' to 'UserIcon' to avoid conflict with the User type
import { ShieldAlert, UserPlus, Trash2, Key, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService, type User } from "@/services/authService";

interface TeamTabProps {
  users: User[];
  onDeleteClick: (e: React.MouseEvent, id: string, username: string) => void;
  onUserAdded: () => void;
}

export function TeamTab({ users, onDeleteClick, onUserAdded }: TeamTabProps) {
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "USER" });

  const handleAddUser = async () => {
    if(!newUser.username || !newUser.password) return toast.error("Please fill username and password");
    try {
      await authService.register(newUser.username, newUser.password, newUser.role);
      toast.success(`User '${newUser.username}' created successfully!`);
      setNewUser({ username: "", password: "", role: "USER" }); 
      onUserAdded(); 
    } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to add user";
        toast.error(msg);
    }
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <CardTitle>Team Management</CardTitle>
        </div>
        <CardDescription>Manage user access and permissions for your team.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        
        {/* ADD USER FORM */}
        <div className="p-5 border rounded-lg bg-gray-50/50">
          <h3 className="font-medium text-sm text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            Add New Team Member
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
              <div className="relative">
                {/* 👇 FIX: Use UserIcon here */}
                <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="jdoe" 
                  className="pl-9 bg-white"
                  value={newUser.username} 
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••" 
                  className="pl-9 bg-white"
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">Role</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="USER">User (Standard)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>

            <Button onClick={handleAddUser} className="w-full">
              Create Account
            </Button>
          </div>
        </div>

        {/* EXISTING USERS LIST */}
        <div>
          <h3 className="text-sm font-semibold mb-3 ml-1">Active Team Members</h3>
          <div className="border rounded-lg divide-y bg-white overflow-hidden">
              {users.length === 0 && (
                <div className="p-8 text-center text-muted-foreground bg-gray-50/30">
                  No other users found. Add one above.
                </div>
              )}
              
              {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                              {user.username.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                              <p className="font-medium text-sm text-gray-900">{user.username}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${user.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                  {user.role}
                                </span>
                                {user.id && (
                                    <span className="text-[10px] text-muted-foreground hidden sm:inline-block">
                                    ID: {user.id.substring(0, 8)}...
                                    </span>
                                )}
                              </div>
                          </div>
                      </div>
                      
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => onDeleteClick(e, user.id!, user.username)} 
                        className="text-muted-foreground hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0 rounded-full"
                        title="Remove User"
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
              ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}