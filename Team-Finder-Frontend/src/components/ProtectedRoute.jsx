import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  // If no user is found in context, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the protected component (like Dashboard)
  return children;
}