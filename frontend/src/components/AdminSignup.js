import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';
import { useNavigate } from 'react-router-dom';

function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState(''); // State to hold error message

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState(''); // State to hold error message
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);

    // Real-time validation
    if (e.target.value !== formData.password) {
      setError("Passwords do not match");
    } else {
      setError(""); // Clear the error when they match
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5050/api/adminSignup', formData);
      const { message, token } = response.data;

      // If signup is successful, store the token and navigate to the desired page
      localStorage.setItem('token', token);
      console.log('Hello World! \t', message);
      setErrorMessage(''); // Clear any existing error message
      navigate('/search');

    } catch (error) {
      console.error('Error:', error.response.data);

      if (error.response && error.response.data && error.response.data.error) {
        // Custom handling for duplicate email error
        if (error.response.data.error.includes('E11000')) {
          setErrorMessage('This email is already registered. Please use another one.');
        } else {
          setErrorMessage(error.response.data.error);
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };


  return (
    <div className="container">
      <h2 className="form-title">Create an Admin Account</h2>
      {/* <h4 className="form-subtitle">
        Create a Car Owner Account <a href="/CarOwnerSignup">here</a>!
      </h4> */}
      {/* Display the error message if it exists */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          className="form-input"
          value={formData.firstName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          className="form-input"
          value={formData.lastName}
          onChange={handleChange}
        />    

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="form-input"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="form-input"
          value={formData.password}
          onChange={handleChange}
        />
{error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="form-input"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
        />
      

        <button type="submit" className="form-button" disabled={error !== ""}>Sign Up</button>
      </form>
      <p className="switch-form">
        Already have an account? <a href="/login">Login here</a>.
      </p>
    </div>
  );
}

export default AdminSignup;
