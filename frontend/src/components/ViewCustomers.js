import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ViewCustomers.css'; // Styling similar to ViewCarOwners

const ViewCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5050/api/admin/customers');
        setCustomers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput) return;
    try {
      const response = await axios.post('http://localhost:5050/api/admin/customers/search', {
        mobileNumber: searchInput,
      });
      setCustomers([response.data]); // Replace the list with the search result
    } catch (err) {
      console.error('Error searching customer:', err);
      alert('No customer found with the provided mobile number.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`http://localhost:5050/api/admin/customer/${id}`);
      setCustomers(customers.filter(customer => customer._id !== id)); // Update state
      alert('Customer deleted successfully!');
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer.');
    }
  };

  const handleEdit = (id) => {
    navigate(`/editcustomer/${id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="customers-page">
      <h1>Customers</h1>
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

      <table className="customers-table">
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer._id}>
              <td>{customer.firstName}</td>
              <td>{customer.lastName}</td>
              <td>{customer.email}</td>
              <td>{customer.mobileNumber}</td>
              <td>{customer.alternateContactNumber || 'N/A'}</td>
              <td>{customer.address}</td>
              <td>{customer.city}</td>
              <td>{customer.state}</td>
              <td>{customer.zipCode}</td>
              <td>
                <button
                  onClick={() => handleEdit(customer._id)}
                  className="edit-button"
                >
                  Edit
                </button>
                {/* <button
                  onClick={() => handleDelete(customer._id)}
                  className="delete-button"
                >
                  Delete
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewCustomers;
