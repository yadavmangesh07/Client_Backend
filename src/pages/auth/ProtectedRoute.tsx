import { Navigate, Outlet } from "react-router-dom";
import { authService } from "@/services/authService";

export const ProtectedRoute = () => {
  const isAuth = authService.isAuthenticated();

  // If authenticated, render the child routes (Outlet)
  // If not, redirect to /login
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};