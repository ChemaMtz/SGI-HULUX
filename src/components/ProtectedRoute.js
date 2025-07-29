// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, adminOnly = false }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.email !== 'admin@hulux.com') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;