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

// 1. Import Framer Motion
import { motion, AnimatePresence } from "framer-motion";

// Import the Floating Overlay Component
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
      {/* --- SIDEBAR --- */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-white border-r shadow-[2px_0_20px_-10px_rgba(0,0,0,0.05)] sm:flex">
        <div className="flex h-20 shrink-0 items-center justify-center px-6 border-b border-gray-50">
          {brand.logo ? (
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <img src={brand.logo} alt={brand.name} className="h-10 w-auto object-contain" />
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
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || (item.href !== "/dashboard" && location.pathname.startsWith(item.href + "/"));
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive ? "bg-primary/10 text-primary shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600")} />
                        {item.label}
                      </div>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t text-xs text-center text-gray-400">JMD Decor v1.0</div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-col flex-1 sm:pl-64 transition-all duration-300">
        <FloatingUserNav />

        {/* 2. Content Area with Universal Page Transitions */}
        <main className="flex-1 p-4 sm:px-8 sm:py-6 mt-16 overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmLogout}>
               <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}