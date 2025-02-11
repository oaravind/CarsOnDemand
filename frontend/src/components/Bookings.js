import React, { useEffect, useState } from "react";
import axios from 'axios';
import '../styles/bookings.css';
import { useNavigate } from "react-router-dom";
import jwtDecode from 'jwt-decode';
import { convertUTCToLocal } from '../modules/CustomFunctions';

function Bookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const username = decoded.username;
  const userId = decoded.id;

  const [rentals, setRentals] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    localStorage.removeItem("car");
    localStorage.removeItem("carOwner");
    navigate("/login"); // Redirect to login page
  };
  const handleRowClick = (rentalId) => {
    navigate(`/booking/${rentalId}`); // Navigate to the rental details page
  };
  useEffect(() => {
    const fetchRentals = async () => {
      try {
        // const customer = JSON.parse(localStorage.getItem('customer'));
        // if (!customer) {
        //   console.error("No customer found in localStorage.");
        //   return;
        // }
        console.log('Fetching rentals with userId:', userId); // Add this line for debugging
        const response = await axios.post('http://localhost:5050/api/user/rentals', { customer: userId });
        console.log('Fetched Rentals:', response.data);
        setRentals(response.data);
      } catch (error) {
        console.error('Error fetching rentals:', error);
      }
    };

    fetchRentals();
  }, []);

  return (
    <div className="bookings-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2 className="sidebar-title">Menu</h2>
        <ul className="sidebar-menu">
          <li><a href="/search">Search</a></li>
          <li><a href="/bookings">Bookings</a></li>
          <li><a href="/settings">Settings</a></li>
          <li><button onClick={logout} className="logout-button">Logout</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar Toggle Button */}
        <button className="sidebar-toggle-button" onClick={handleSidebarToggle}>
          {sidebarOpen ? '✖️' : '🟰'}
        </button>

        <h2 className="form-title">Your Bookings, {username}</h2>

        {rentals.length > 0 ? (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Location</th>
                <th>Pick Up Date</th>
                <th>Drop Off Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental._id} onClick={() => handleRowClick(rental._id)} >
                  <td>{rental.car?.maker} {rental.car?.model}</td>
                  <td>{rental.pickUpAddress}</td>
                  <td>{convertUTCToLocal(rental.startDate)}</td>
                  <td>{convertUTCToLocal(rental.endDate)}</td>
                  <td>${rental.totalCost}</td>
                  <td>{rental.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
    </div>
  );
}

export default Bookings;
