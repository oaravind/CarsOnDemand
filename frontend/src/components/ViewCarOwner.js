import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ViewCarOwner.css';

const CarOwnersPage = () => {
  const [carOwners, setCarOwners] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarOwners = async () => {
      try {
        const response = await axios.get('http://localhost:5050/api/admin/carOwners');
        setCarOwners(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching car owners:', err);
        setError('Failed to load car owners.');
        setLoading(false);
      }
    };

    fetchCarOwners();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput) return;
    try {
      const response = await axios.post(`http://localhost:5050/api/admin/carOwners/search`,{mobileNumber:searchInput});
      setSearchResult(response.data);
    } catch (err) {
      console.error('Error searching car owner:', err);
      alert('No car owner found with the provided mobile number.');
      setSearchResult(null); // Clear previous results if search fails
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car owner?')) return;
    try {
      await axios.delete(`http://localhost:5050/api/admin/carowner/${id}`);
      setCarOwners(carOwners.filter(owner => owner._id !== id)); // Update state
      if (searchResult && searchResult._id === id) setSearchResult(null); // Remove search result if deleted
      alert('Car owner deleted successfully!');
    } catch (err) {
      console.error('Error deleting car owner:', err);
      alert('Failed to delete car owner.');
    }
  };

  const handleEdit = (id) => {
    navigate(`/editcarowner/${id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="car-owners-page">
      <h1>Car Owners</h1>

      {/* Search Box */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by Mobile Number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {searchResult && (
        <table className="car-owners-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Alternate Phone Number</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Zip Code</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr key={searchResult._id}>
              <td>{searchResult.firstName}</td>
              <td>{searchResult.lastName}</td>
              <td>{searchResult.email}</td>
              <td>{searchResult.mobileNumber}</td>
              <td>{searchResult.alternateContactNumber}</td>
              <td>{searchResult.address}</td>
              <td>{searchResult.city}</td>
              <td>{searchResult.state}</td>
              <td>{searchResult.zipCode}</td>
              <td>{searchResult.isVerified ? 'Verified' : 'Pending'}</td>
              <td>
                <button onClick={() => handleEdit(searchResult._id)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(searchResult._id)} className="delete-button">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Car Owners Table */}
      <table className="car-owners-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Alternate Phone Number</th>
            <th>Address</th>
            <th>City</th>
            <th>State</th>
            <th>Zip Code</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {carOwners.map(owner => (
            <tr key={owner._id}>
              <td>{owner.firstName}</td>
              <td>{owner.lastName}</td>
              <td>{owner.email}</td>
              <td>{owner.mobileNumber}</td>
              <td>{owner.alternateContactNumber}</td>
              <td>{owner.address}</td>
              <td>{owner.city}</td>
              <td>{owner.state}</td>
              <td>{owner.zipCode}</td>
              <td>{owner.isVerified ? 'Verified' : 'Pending'}</td>
              <td>
                <button onClick={() => handleEdit(owner._id)} className="edit-button">Edit</button>
                {/* <button onClick={() => handleDelete(owner._id)} className="delete-button">Delete</button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CarOwnersPage;
