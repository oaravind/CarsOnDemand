import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

function AccessWrapper({ children }) {
  const navigate = useNavigate();
  const { settlementToken } = useParams(); // Extracting token from URL params

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Save the intended URL to redirect after login
      localStorage.setItem('redirectAfterLogin', `/settlement/${settlementToken}`);
      navigate('/login'); // Redirect to login page
    } else {
      try {
        const decoded = jwtDecode(token);
        const jwtCustomerId = jwtDecode(settlementToken).customerId;

        if (decoded.role !== 'Customer' || decoded.id !== jwtCustomerId) {
          alert('You do not have permission to access this page.');
          navigate('/dashboard'); // Redirect to a generic customer dashboard or another page
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        navigate('/dashboard');
      }
    }
  }, [navigate, settlementToken]);

  return children;
}

export default AccessWrapper;
