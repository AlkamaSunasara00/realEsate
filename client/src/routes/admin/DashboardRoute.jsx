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
import ViewAdmin from "../../pages/admin/manage_admin/ViewAdmin";
import AssignedProperty from "../../pages/admin/properties/AssignProperties";
import AddAssignment from "../../pages/admin/properties/AddAssignedProperties";
import UpdateAssignment from "../../pages/admin/properties/UpdateAssignedProperties";
import GetProperties from "../../pages/admin/properties/Property";
import PaymentsHistory from "../../pages/admin/payments/PaymentsHistory";
import AddPayment from "../../pages/admin/payments/AddPayment";
import UpdatePayment from "../../pages/admin/payments/UpdatePayment";
import PropertyDetails from "../../pages/admin/properties/propertyDetails";

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
        <Route path="view-admin/:id" element={<ViewAdmin />} />
        <Route path='property' element={<GetProperties />} />
        <Route path='addproperty' element={<AddProperty />} />
        <Route path='updateproperty' element={<UpdateProperty />} />
        <Route path='propertyassigned' element={<AssignedProperty />} />
        <Route path='addpropertyassigned' element={<AddAssignment />} />
        <Route path='updatepropertyassigned' element={<UpdateAssignment />} />
        <Route path='property/:id' element={<PropertyDetails />} />
        <Route path='payments' element={<PaymentsHistory />} />
        <Route path='addpayment' element={<AddPayment />} />
        <Route path='updatepayment' element={<UpdatePayment />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
