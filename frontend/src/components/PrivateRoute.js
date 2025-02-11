import { Navigate } from 'react-router-dom';
import React from 'react';
import jwtDecode from 'jwt-decode';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If no token is found, redirect to login
    return <Navigate to="/login" />;
  }

  try {
    // Decode the token to extract role information
    const decoded = jwtDecode(token);
    const role = decoded.role;

    // Check if the role matches any of the allowed roles for this route
    if (allowedRoles.includes(role)) {
      return children;
    } else {
      // If the role doesn't match, redirect to login
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // If there's an error decoding the token, redirect to login
    console.error('Error decoding token in PrivateRoute:', error);
    return <Navigate to="/login" />;
  }
}

export default PrivateRoute;
