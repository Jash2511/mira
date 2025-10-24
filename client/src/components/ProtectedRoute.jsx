import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const auth = localStorage.getItem('auth');
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}
