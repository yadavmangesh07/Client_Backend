import { useEffect, useState } from "react"; 
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  Users, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  User, 
  Building2, 
  //FolderOpen, 
  Truck, 
  FileCheck,
  Calculator,
  ShoppingCart
} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";
import { companyService } from "@/services/companyService"; 

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 👇 Import the Floating Overlay Component
import { FloatingUserNav } from "@/components/common/FloatingUserNav";

export function MainLayout() {
  const location = useLocation();
  const [brand, setBrand] = useState({ name: "JMD Decor", logo: "" });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const profile = await companyService.getProfile();
        if (profile) {
          setBrand({
            name: profile.companyName || "JMD Decor",
            logo: profile.logoUrl || ""
          });
        }
      } catch (error) {
        console.error("Failed to load branding");
      }
    };
    loadBranding();
  }, []);

  // 👇 UPDATED: Organized Navigation into Groups
  const navGroups = [
    {
      title: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/clients", label: "Clients", icon: Users },
      ]
    },
    {
      title: "Finance",
      items: [
        { href: "/invoices", label: "Invoices", icon: FileText },
        { href: "/purchases", label: "Purchases", icon: ShoppingCart },
        { href: "/estimates", label: "Estimates", icon: Calculator },
      ]
    },
    {
      title: "Operations",
      items: [
        { href: "/challans", label: "Delivery Challans", icon: Truck },
        { href: "/wcc", label: "Work Certificates", icon: FileCheck },
        //{ href: "/files", label: "Files & Folders", icon: FolderOpen },
      ]
    },
    {
      title: "System",
      items: [
        { href: "/profile", label: "My Company", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  const confirmLogout = () => {
    authService.logout();
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fc]"> 
      {/* Changed bg to a very light cool gray for better contrast */}
      
      {/* --- SIDEBAR --- */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-white border-r shadow-[2px_0_20px_-10px_rgba(0,0,0,0.05)] sm:flex">
        
        {/* Brand Header - Centered */}
        {/* 👇 UPDATED: Added 'justify-center' to center the logo */}
        <div className="flex h-20 shrink-0 items-center justify-center px-6 border-b border-gray-50">
          {brand.logo ? (
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-10 w-auto object-contain" 
              />
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-gray-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                 <Building2 className="h-5 w-5" />
              </div>
              <span>{brand.name}</span>
            </Link>
          )}
        </div>
        
        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Group Title */}
              <h3 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {group.title}
              </h3>
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  // Check active state
                  const isActive = location.pathname === item.href || (item.href !== "/dashboard" && location.pathname.startsWith(item.href + "/"));
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-primary/10 text-primary shadow-sm" // Active Style
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900" // Inactive Style
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600")} />
                        {item.label}
                      </div>
                      
                      {/* Active Indicator Dot */}
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-in fade-in zoom-in" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Optional Footer/Version Info */}
        <div className="p-4 border-t text-xs text-center text-gray-400">
            JMD Decor v1.0
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-col flex-1 sm:pl-64 transition-all duration-300">
        
        {/* Floating User Nav Overlay */}
        <FloatingUserNav />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:px-8 sm:py-6 mt-16 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </main>
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
               <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}