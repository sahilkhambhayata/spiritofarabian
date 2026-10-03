import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("soa_auth_token");
  const userStr = localStorage.getItem("soa_admin_user");
  let user: any = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }

  // Check if authenticated as admin or superadmin
  const isAuthenticated = !!token && (user?.role === "admin" || user?.role === "superadmin" || user?.role === "manager");

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
