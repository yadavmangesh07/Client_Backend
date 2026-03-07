import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"; // 👈 Import Outlet
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { useIdleTimeout } from "./hooks/useIdleTimeout"; // 👈 Import your new hook

// Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import ClientPage from "./pages/Clients/ClientPage"; 
import InvoicePage from "./pages/invoices/InvoicePage";
import LoginPage from "./pages/auth/LoginPage";

// Auth Guard
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import SettingsPage from "./pages/settings/SettingsPage";
import FilesPage from "./pages/files/FilesPage";
import ClientProjectsPage from "./pages/projects/ClientProjectsPage";
import ChallanListPage from "./pages/challan/ChallanListPage";
import ChallanFormPage from "./pages/challan/ChallanFormPage";
import MyAccountPage from "./pages/settings/MyAccountPage";
import WCCListPage from "./pages/wcc/WCCListPage";
import WCCFormPage from "./pages/wcc/WCCFormPage";
import CompanyProfilePage from "@/pages/profile/CompanyProfilePage";
import ClientProfilePage from "./pages/Clients/ClientProfilePage";

import EstimateListPage from "./pages/estimates/EstimateListPage";
import EstimateFormPage from "./pages/estimates/EstimateFormPage"; 
import InvoiceFormPage from "./pages/invoices/InvoiceFormPage";
import PurchasesPage from "./pages/purchases/PurchasePage";

// 👇 NEW: Wrapper component to initialize the timer inside the Router
const IdleTimerLayout = () => {
  useIdleTimeout(); // 1 Hour default
  return <Outlet />; // Renders the nested routes below it
};

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Auth Guard */}
        <Route element={<ProtectedRoute />}>
          
          {/* 👇 NEW: Idle Timer Guard (Only runs when logged in) */}
          <Route element={<IdleTimerLayout />}>
            
            {/* UI Layout Wrapper */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientPage />} />
              <Route path="/clients/:id/profile" element={<ClientProfilePage />} />
              
              <Route path="/invoices" element={<InvoicePage />} />
              <Route path="/invoices/new" element={<InvoiceFormPage />} />
              <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />
              
              <Route path="/challans" element={<ChallanListPage />} />
              <Route path="/challans/new" element={<ChallanFormPage />} />
              <Route path="/challans/:id/edit" element={<ChallanFormPage />} />
              
              <Route path="/estimates" element={<EstimateListPage />} /> 
              <Route path="/estimates/new" element={<EstimateFormPage />} />
              <Route path="/estimates/:id/edit" element={<EstimateFormPage />} />
              
              <Route path="/wcc" element={<WCCListPage />} />
              <Route path="/wcc/new" element={<WCCFormPage />} />
              <Route path="/wcc/:id/edit" element={<WCCFormPage />} />
              
              <Route path="/files" element={<FilesPage />} />
              <Route path="/files/:clientId" element={<ClientProjectsPage />} />
              
              <Route path="/profile" element={<CompanyProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/account" element={<MyAccountPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;