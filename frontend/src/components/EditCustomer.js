import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditCustomer.css'; // Create this file for styling
import { states } from '../modules/CustomFunctions'; // Import the states array from the module
import ImageUpload from './ImageUpload';

const EditCustomer = () => {
  const { id } = useParams(); // Get customer ID from the URL
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/admin/customer/${id}`);
        setCustomer(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Failed to load customer details.');
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };
  const handleImageUploadComplete = (imageUrls) => {
    console.log('Uploaded image URL:', imageUrls[0]);
    //setImageUrl(imageUrls[0]);
    let name = 'drivingLicense';
    setCustomer({ ...customer, [name]: imageUrls[0] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/api/admin/customer/edit/${id}`, customer);
      alert('Customer details updated successfully!');
      navigate('/customers');
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Failed to update customer details.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="edit-customer">
      <h1>Edit Customer</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input type="text" name="firstName" value={customer.firstName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input type="text" name="lastName" value={customer.lastName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={customer.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Mobile Number:</label>
          <input type="text" name="mobileNumber" value={customer.mobileNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Alternate Phone Number:</label>
          <input type="text" name="alternateContactNumber" value={customer.alternateContactNumber} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input type="text" name="address" value={customer.address} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>City:</label>
          <input type="text" name="city" value={customer.city} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>State:</label>
          <select name="state" value={customer.state} onChange={handleChange} required>
            {states.map((state, index) => (
              <option key={index} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Zip Code:</label>
          <input type="text" name="zipCode" value={customer.zipCode} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Driving License:</label>
          {customer.drivingLicense ? (<img src={customer.drivingLicense} alt="Driving License" className="car-image" />)
          
          :( <ImageUpload
            onUploadComplete={handleImageUploadComplete}
            maxNumberOfFiles={1}
            multiple={false}
          />)}
        </div>
        <button type="submit" className="save-button">Save Changes</button>
        <button type="button" className="cancel-button" onClick={() => navigate('/customers')}>Cancel</button>
      </form>
    </div>
  );
};

export default EditCustomer;
