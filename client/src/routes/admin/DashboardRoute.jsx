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
import UpdateProperty from "../../pages/admin/properties/UpdateProperty";
import AddProperty from "../../pages/admin/properties/AddProperty";
import Properties from "../../pages/admin/properties/Property";

const AppRoutes = () => {

  const Navigate = useNavigate()

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
        <Route path='property' element={<Properties />} />
        <Route path='addproperty' element={<AddProperty />} />
        <Route path='updateproperty' element={<UpdateProperty />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
