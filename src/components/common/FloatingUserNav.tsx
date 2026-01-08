import { useEffect, useState } from "react";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { authService, type User as AuthUser } from "@/services/authService";
import { useNavigate } from "react-router-dom";

export function FloatingUserNav() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  if (!user) return null;

  return (
    // 👇 FIXED OVERLAY POSITIONING
    <div className="fixed top-4 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-12 pl-2 pr-3 rounded-full bg-white/95 backdrop-blur shadow-md hover:shadow-lg hover:bg-white border-gray-200 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Avatar className="h-8 w-8 border border-gray-100">
                <AvatarFallback className={`text-xs font-bold ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Text Info (Hidden on very small screens if needed) */}
              <div className="flex flex-col items-start text-left mr-1">
                <span className="text-xs font-semibold text-gray-800 leading-none mb-0.5">
                  {user.username}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-none">
                  {user.role}
                </span>
              </div>
              
              <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              {/* <p className="text-xs leading-none text-muted-foreground">
                {user.role} Account
              </p> */}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 focus:bg-red-50" 
            onClick={() => { authService.logout(); window.location.reload(); }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}