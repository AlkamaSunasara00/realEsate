import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const adminId = userData.id;
  const token = adminId ? localStorage.getItem(`accessToken_${adminId}`) || localStorage.getItem('accessToken') : null;
  const isLoggedIn = adminId ? localStorage.getItem(`isLoggedIn_${adminId}`) || localStorage.getItem('isLoggedIn') : null;

  if (!token || isLoggedIn !== 'true') {
    console.log(`ProtectedRoute: No valid token or login status for admin ${adminId}, redirecting to login`);
    return <Navigate to="/admin/login" replace />;
  }

  console.log(`ProtectedRoute: Access granted for admin ${adminId}`);
  return children;
};

export default ProtectedRoute;
