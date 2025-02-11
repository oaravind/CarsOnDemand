import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './ImageUpload';
import { states } from '../modules/CustomFunctions';

/*
username
email
password
mobileNumber
address
city
state
zipCode
alternateContactNumber
*/
function SignUpPage() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    stateID: '',
    address: '',
    password: '',
    city: '',
    state: '',
    zipCode: '',
    alternateContactNumber: '',
  });

  const { firstName, lastName, email, mobileNumber, address, password, stateID, city, state, zipCode, alternateContactNumber } = formData;
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error message

  const handleImageUploadComplete = (imageUrls) => {
    console.log('Uploaded image URL:', imageUrls[0]);
    //setImageUrl(imageUrls[0]);
    setFormData({ ...formData, stateID: imageUrls[0] });
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
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5050/api/CarOwnerSignup', formData);
      //alert(response.data.message);
      const { message, token } = response.data;
      localStorage.setItem('token', token);
      navigate('/dashboard');
      console.log('Hello World! \t', message);
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
      <h2 className="form-title">Create a Car Owner Account</h2>
      <h4 className="form-subtitle">
        Create a Customer Account <a href="/signup">here</a>!
      </h4>
      {/* Display the error message if it exists */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          className="form-input"
          value={firstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          className="form-input"
          value={lastName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="form-input"
          value={email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="form-input"
          value={password}
          onChange={handleChange}
          required
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

        <input
          type="tel"
          name="mobileNumber"
          placeholder="Phone"
          className="form-input"
          value={mobileNumber}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="alternateContactNumber"
          placeholder="Alternate Contact Number"
          className="form-input"
          value={alternateContactNumber}
          onChange={handleChange}
          required
        />

        {/* <input
            type="text"
            name="stateID"
            placeholder="State ID"
            className="form-input"
            value={stateID}
            onChange={handleChange}
        /> */}
        <label htmlFor="stateID">Upload your State ID</label>

        <ImageUpload
          onUploadComplete={handleImageUploadComplete}
          maxNumberOfFiles={1}
          multiple={false}
          
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          className="form-input"
          value={address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          className="form-input"
          value={city}
          onChange={handleChange}
          required
        />

        {/* <input
          type="text"
          name="state"
          placeholder="State"
          className="form-input"
          value={state}
          onChange={handleChange}
        /> */}

        <select
          name="state"
          value={state}
          onChange={handleChange}
          className="form-input"
          required
        >
          <option value="">Select state</option>
          {states.map((state, index) => (
            <option key={index} value={state}>{state}</option>
          ))}
        </select>

        <input
          type="text"
          name="zipCode"
          placeholder="Zip Code"
          className="form-input"
          value={zipCode}
          onChange={handleChange}
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

export default SignUpPage;
