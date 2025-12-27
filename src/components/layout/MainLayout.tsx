import { useEffect, useState } from "react"; // 👈 Import Hooks
import { Link, useLocation, Outlet } from "react-router-dom";
import { Users, FileText, LayoutDashboard, LogOut, Settings, User, Building2 } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";
import { companyService } from "@/services/companyService"; // 👈 Import Company Service

export function MainLayout() {
  const location = useLocation();
  
  // 1. State to hold branding info
  const [brand, setBrand] = useState({ name: "JMD Decor", logo: "" });

  // 2. Load Profile on Mount
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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "My Company", href: "/profile", icon: User },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      authService.logout();
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        
        {/* 👇 3. Dynamic Brand Header */}
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          {brand.logo ? (
            // Option A: Show Logo if it exists
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-8 w-auto object-contain max-w-[180px]" 
              />
            </Link>
          ) : (
            // Option B: Show Text/Icon if no logo
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Building2 className="h-6 w-6 text-primary" />
              <span>{brand.name}</span>
            </Link>
          )}
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 flex flex-col gap-4 px-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button at bottom */}
        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}