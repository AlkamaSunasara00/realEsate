// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const adminId = userData.id;
  const role = userData.role;
  const token =
    adminId
      ? localStorage.getItem(`accessToken_${adminId}`) || localStorage.getItem('accessToken')
      : null;
  const isLoggedIn =
    adminId
      ? localStorage.getItem(`isLoggedIn_${adminId}`) || localStorage.getItem('isLoggedIn')
      : null;

  // Not logged in → kick to login
  if (!token || isLoggedIn !== 'true') {
    console.log(`ProtectedRoute: No valid token or login status for admin ${adminId}, redirecting to login`);
    return <Navigate to="/admin/login" replace />;
  }

  // If user is client → only allow view-admin/:id
  if (role === 'client') {
    const allowedPath = `/admin/view-admin/${adminId}`;
    if (location.pathname !== allowedPath) {
      console.log(`ProtectedRoute: Client tried to access ${location.pathname}, redirecting to ${allowedPath}`);
      return <Navigate to={allowedPath} replace />;
    }
  }

  // Otherwise → let them in
  return children;
};

export default ProtectedRoute;
