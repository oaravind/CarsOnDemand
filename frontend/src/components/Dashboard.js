import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { convertUTCToLocal } from "../modules/CustomFunctions";
function CarOwnerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const username = decoded.username;
  const userId = decoded.id;

  const [balance, setBalance] = useState(0);
  const [rentals, setRentals] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("carOwner");
    navigate("/login");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await 
          axios.post(`http://localhost:5050/api/CarOwner/dashboard`, {userId});
        setRentals(response.data.rentals);
        setBalance(response.data.balance);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [userId]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Menu</h2>
        <button className="close-sidebar-button" onClick={handleSidebarToggle}>
          ✖️
        </button>
        <ul className="sidebar-menu">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/cars">Cars</a></li>
          <li><a href="/rentals">Rentals</a></li>
          <li><a href="/settings">Settings</a></li>
          <li><button onClick={logout} className="logout-button">Logout</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar Toggle Button */}
        <button className="sidebar-toggle-button" onClick={handleSidebarToggle}>
          {sidebarOpen ? "✖️" : "🟰"}
        </button>

        <h2 className="form-title">Car Owner Dashboard</h2>
        <p className="form-subtitle">Welcome, {username}!</p>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Tiles */}
          <div className="dashboard-tile">
            <p className="tile-title">Balance</p>
            <p className="tile-value">${balance}</p>
          </div>
          <div className="dashboard-tile">
            <p className="tile-title">No. of Rentals</p>
            <p className="tile-value">{rentals.length}</p>
          </div>

          {/* Card */}
          <div className="dashboard-card">
            <p className="card-title">Upcoming Rentals</p>
            {rentals.length > 0 ? (
  <ul className="rentals-list">
    {rentals.map((rental) => 
      rental.status === 'Booked' ? ( // Conditional check
        <li key={rental.id} className="rental-item">
          <p>{rental.car.make} {rental.car.model}</p>
          <p>{convertUTCToLocal(rental.startDate)} - {convertUTCToLocal(rental.endDate)}</p>
        </li>
      ) : null // Return null if the condition doesn't match
    )}
  </ul>
) : (
  <p>No rentals found.</p>
)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarOwnerDashboard;
