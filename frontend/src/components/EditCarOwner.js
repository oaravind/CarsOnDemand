import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditCarOwner.css'; // Create this file for styling
import {states} from '../modules/CustomFunctions'; // Import the states array from the module
const EditCarOwner = () => {
  const { id } = useParams(); // Get car owner ID from the URL
  const [carOwner, setCarOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarOwner = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/admin/carOwner/${id}`);
        setCarOwner(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching car owner:', err);
        setError('Failed to load car owner details.');
        setLoading(false);
      }
    };

    fetchCarOwner();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarOwner({ ...carOwner, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/api/admin/carOwner/edit/${id}`, carOwner);
      alert('Car owner details updated successfully!');
      navigate('/carowners');
    } catch (err) {
      console.error('Error updating car owner:', err);
      alert('Failed to update car owner details.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="edit-car-owner">
      <h1>Edit Car Owner</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input type="text" name="firstName" value={carOwner.firstName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input type="text" name="lastName" value={carOwner.lastName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={carOwner.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Mobile Number:</label>
          <input type="text" name="mobileNumber" value={carOwner.mobileNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Alternate Phone Number:</label>
          <input type="text" name="alternateContactNumber" value={carOwner.alternateContactNumber} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input type="text" name="address" value={carOwner.address} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>City:</label>
          <input type="text" name="city" value={carOwner.city} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>State:</label>
          <select name="state" value={carOwner.state} onChange={handleChange} required>
            {states.map((state, index) => (
              <option key={index} value={state}>
                {state}
              </option>
            ))}
            </select>
        </div>
        <div className="form-group">
          <label>Zip Code:</label>
          <input type="text" name="zipCode" value={carOwner.zipCode} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>State ID:</label>
          {/* <input type="file" name="stateID" onChange={handleChange} /> */}
          {carOwner.stateID && <img src={carOwner.stateID} alt="State ID" className="car-image" />}
        </div>
        
        <div className="form-group">
          <label>Status:</label>
          <select name="isVerified" value={carOwner.isVerified} onChange={handleChange} required>
            <option value={true}>Verified</option>
            <option value={false}>Pending</option>
          </select>
        </div>
        <button type="submit" className="save-button">Save Changes</button>
        <button type="button" className="cancel-button" onClick={() => navigate('/carowners')}>Cancel</button>
      </form>
    </div>
  );
};

export default EditCarOwner;
