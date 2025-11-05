// DashboardRoute.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "../../pages/admin/login/Login";
import AdminLayout from "../../pages/admin/layout/AdminLayout";
import Dashboard from "../../pages/admin/dashboard/Dashboard";
import ManageAdmin from "../../pages/admin/manage_admin/ManageAdmin";
import AddNewAdmin from "../../pages/admin/manage_admin/AddNewAdmin";
import ProtectedRoute from "../../components/PrivateRoute";
import useAuthRefresh from '../../hooks/useAuthRefresh';
import EditAdmin from "../../pages/admin/manage_admin/EditAdmin";
import "../../assets/css/admin/product.css"

const AppRoutes = () => {

    const Navigate=useNavigate()

  useAuthRefresh();
  
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage-admins" element={<ManageAdmin />} />
        <Route path="add-new_admin" element={<AddNewAdmin />} />
        <Route path="edit-admin/:id" element={<EditAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
