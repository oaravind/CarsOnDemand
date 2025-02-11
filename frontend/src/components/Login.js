import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
function LoginPage() {
  const [email, setEmail] = useState(''); // Assuming 'username' is the email
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5050/api/login', {
        email,
        password,
      });
      const { token } = response.data;

      localStorage.setItem('token', token);
      // Check if there's a redirect URL stored in localStorage
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      }

      console.log('Hello World! \t', response);
      // Decode the token to get the role
      const decoded = jwtDecode(token);
      const role = decoded.role;


      //alert('Token:'+ response.data.token);
      //alert('Role:'+ role);
      if (role === 'CarOwner') {
        navigate('/dashboard');
      } else if (role === 'Customer') {
        navigate('/search');
      } else if (role === 'Admin') {
        navigate('/admin');
      }
      //alert(response.data.message);
      // Redirect to home page or perform further actions
      //window.location.href = '/dashboard';
    } catch (error) {
      // Display a more useful error message
      alert('Error: ' + (error.response && error.response.data && error.response.data.error));
    }
  };

  return (
    <div className="container">
      <h2 className="form-title">Login</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="Email"
          placeholder="Username"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="form-button">Login</button>
      </form>
      <p className="switch-form">
        Don't have an account? <a href="/signup">Sign Up here as Customer</a>.
      </p>
    </div>
  );
}

export default LoginPage;
