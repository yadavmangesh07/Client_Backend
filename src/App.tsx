import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import CompanyProfilePage from "@/pages/profile/CompanyProfilePage";
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

// 👇 FIX THIS IMPORT
import WCCFormPage from "./pages/wcc/WCCFormPage"; 

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🔒 Protected Routes (Everything inside here requires login) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientPage />} />
            <Route path="/invoices" element={<InvoicePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<CompanyProfilePage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/files/:clientId" element={<ClientProjectsPage />} />
            <Route path="/challans" element={<ChallanListPage />} />
            <Route path="/challans/new" element={<ChallanFormPage />} />
            <Route path="/challans/:id/edit" element={<ChallanFormPage />} />
            
            {/* WCC Routes */}
            <Route path="/wcc" element={<WCCListPage />} />
            <Route path="/wcc/new" element={<WCCFormPage />} />
            <Route path="/wcc/:id/edit" element={<WCCFormPage />} />
            
            <Route path="/account" element={<MyAccountPage />} />
          </Route>
        </Route>

        {/* Catch-all: Redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;