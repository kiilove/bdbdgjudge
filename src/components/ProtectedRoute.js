// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, currentUser }) => {
  return currentUser ? element : <Navigate to="/admin-login" replace />;
};

export default ProtectedRoute;
