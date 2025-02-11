import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../styles/search.css';
import { useNavigate } from "react-router-dom";
import jwtDecode from 'jwt-decode';
import { calculateNumberOfDays, calculatePrice } from '../modules/CustomFunctions';

function Search() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const username = decoded.username;
  const userId = decoded.id;
  const email = decoded.email;

  // State Variables
  const [cars, setCars] = useState([]);
  const [availableStartDate, setAvailableStartDate] = useState('');
  const [availableEndDate, setAvailableEndDate] = useState('');
  const [pickUpTime, setPickUpTime] = useState('09:00 AM');
  const [dropOffTime, setDropOffTime] = useState('09:00 AM');
  const [location, setLocation] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    // Load saved search data from localStorage, if available
    const savedSearchData = localStorage.getItem('searchData');
    if (savedSearchData) {
      const { location, availableStartDate, availableEndDate, pickUpTime, dropOffTime, cars, searchPerformed } = JSON.parse(savedSearchData);
      setLocation(location);
      setAvailableStartDate(availableStartDate);
      setAvailableEndDate(availableEndDate);
      setPickUpTime(pickUpTime);
      setDropOffTime(dropOffTime);
      setCars(cars);
      setSearchPerformed(searchPerformed);
    }
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'availableStartDate') setAvailableStartDate(value);
    else if (name === 'availableEndDate') setAvailableEndDate(value);
    else if (name === 'location') setLocation(value);
    else if (name === 'pickUpTime') setPickUpTime(value);
    else if (name === 'dropOffTime') setDropOffTime(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearchPerformed(true);

    // Calculate pickup and dropoff dates as Date objects
    const pickupDateTime = new Date(`${availableStartDate} ${pickUpTime}`);
    const dropoffDateTime = new Date(`${availableEndDate} ${dropOffTime}`);

    try {
      const response = await axios.post('http://localhost:5050/api/car/search', {
        location,
        availableStartDate,
        availableEndDate,
        pickUpTime,
        dropOffTime
      });

      setCars(response.data);
      const numberOfDays = calculateNumberOfDays(availableStartDate, availableEndDate);
      
      // Save customer search data to localStorage
      const customer = {
        id: userId,
        email,
        location,
        availableStartDate,
        availableEndDate,
        pickUpTime,
        dropOffTime,
        pickupDateTime: pickupDateTime.toString(),
        dropoffDateTime: dropoffDateTime.toString(),
      };
      localStorage.setItem('customer', JSON.stringify(customer));

      // Save search data to localStorage
      const searchData = {
        location,
        availableStartDate,
        availableEndDate,
        pickUpTime,
        dropOffTime,
        cars: response.data,
        numberOfDays,
        searchPerformed: true,
      };
      localStorage.setItem('searchData', JSON.stringify(searchData));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    localStorage.removeItem("car");
    localStorage.removeItem("carOwner");
    localStorage.removeItem("searchData");
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="search-container">
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
        <button className="sidebar-toggle-button" onClick={handleSidebarToggle}>
          {sidebarOpen ? '✖️' : '🟰'}
        </button>

        <h2 className="form-title">COD - Cars on Demand! 🏎️</h2>
        <p className="form-subtitle">
          Welcome to the Search, {username}!
        </p>
        <div className="card search-card">
          <form onSubmit={handleSubmit}>
            <div className="search-form">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={location}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="availableStartDate"
                  value={availableStartDate}
                  onChange={handleChange}
                  className="form-input"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pick Up Time</label>
                <select name="pickUpTime" className="form-input" value={pickUpTime} onChange={handleChange} required>
                  {/* Time options */}
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                  <option value="09:00 PM">09:00 PM</option>
                  {/* Add other time options as necessary */}
                </select>
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="availableEndDate"
                  value={availableEndDate}
                  onChange={handleChange}
                  className="form-input"
                  min={availableStartDate || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Drop Off Time</label>
                <select name="dropOffTime" className="form-input" value={dropOffTime} onChange={handleChange} required>
                  {/* Time options */}
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                  <option value="09:00 PM">09:00 PM</option>
                  {/* Add other time options as necessary */}
                </select>
              </div>

              <div className="form-group">
                <button type="submit" className="form-button">Search</button>
              </div>
            </div>
          </form>
        </div>

        <div className="car-list">
          {cars.length > 0 ? (
            cars.map(car => (
              <div key={car.id} className="card">
                <div className="car-card-content">
                  <img src={car.images[0]} alt={car.maker} className="car-image" />
                  <div className="car-details">
                    <h3>{car.maker} {car.model}</h3>
                    <p>${car.pricePerDay} per day</p>
                    <h4>Estimated Price: ${calculatePrice(
                      new Date(`${availableStartDate} ${pickUpTime}`),
                      new Date(`${availableEndDate} ${dropOffTime}`),
                      car.pricePerDay, car.pricePerHour, car.minimumHours
                    )}</h4>
                    <button className="form-button" onClick={() => navigate(`/car/${car._id}`)}>View Car</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            searchPerformed && <p className="no-cars">No cars found, try different dates or city.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
