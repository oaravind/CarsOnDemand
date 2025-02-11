import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/rentals.css";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { convertUTCToLocal } from "../modules/CustomFunctions";


function Rentals() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const username = decoded.username;
  const userId = decoded.id;

  const [rentals, setRentals] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("car");
    localStorage.removeItem("carOwner");
    navigate("/login");
  };

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        if (!userId) {
          console.error("No Car Owner ID found.");
          return;
        }
        const response = await axios.post(
          "http://localhost:5050/api/carOwner/rentals",
          { owner: userId }
        );
        console.log("Fetched Rentals:", response.data);
        setRentals(response.data);
      } catch (error) {
        console.error("Error fetching rentals:", error);
      }
    };

    fetchRentals();
  }, [userId]);

  return (
    <div className="rentals-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Menu</h2>
        <ul className="sidebar-menu">
          <li>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li><a href="/cars">Cars</a></li>
          <li>
            <a href="/rentals">Rentals</a>
          </li>
          <li>
            <a href="/settings">Settings</a>
          </li>
          <li>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <button className="sidebar-toggle-button" onClick={handleSidebarToggle}>
          {sidebarOpen ? "✖️" : "🟰"}
        </button>

        <h2 className="form-title">Your Rentals, {username}</h2>

        {rentals.length > 0 ? (
          <div className="rental-cards">
            {rentals.map((rental) => (
              <div key={rental._id} className="rental-card">
                <div className="card-left">
                  <p className="car-name">
                    {rental.car?.maker} {rental.car?.model}
                  </p>
                  <p className="rental-dates">
                    {convertUTCToLocal(rental.startDate)} -{" "}
                    {convertUTCToLocal(rental.endDate)}
                  </p>
                  <p className="rental-price">Price: ${rental.totalCost}</p>
                </div>
                <div className="card-right">
                  <table>
                    <tbody>
                      <tr>
                        <td>Status: </td>
                        <td>{rental.status}</td>
                      </tr>
                      <tr><td>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/rental/${rental._id}`)}
                  >
                    View
                  </button>
                  </td>
                  </tr>
                  </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No rentals found.</p>
        )}
      </div>
    </div>
  );
}

export default Rentals;
