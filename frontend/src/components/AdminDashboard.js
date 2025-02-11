import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css'; // Importing the CSS file for styling
import jwtDecode from 'jwt-decode'; // Importing jwt-decode library to decode JWT tokens

function AdminDashboard() {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const username = decoded.username;
  const userId = decoded.id;

  const [commissionAmount, setCommissionAmount] = useState(0);
  const [carOwners, setCarOwners] = useState([]);
  const [carOwnersCount, setCarOwnersCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [carsCount, setCarsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to handle sidebar visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming you have an endpoint `/api/admin/dashboard` that returns all data in one call
        const response = await axios.post('http://localhost:5050/api/admin/dashboard', { adminId: userId });

        // Assuming response data has the following format:
        // { commissionAmount: number, carOwnersCount: number, customersCount: number, carsCount: number }
        const { commissionAmount, carOwnersCount, customersCount, carsCount } = response.data;

        // Set state variables
        setCommissionAmount(commissionAmount);
        setCarOwnersCount(carOwnersCount);
        setCustomersCount(customersCount);
        setCarsCount(carsCount);
        setCarOwners(response.data.carOwners);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error fetching data: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }
const handleVerify = async (id) => {
    try {
        await axios.post(`http://localhost:5050/api/admin/verifyCarOwner`, { id });
        alert('Car Owner verified successfully!');
        // Optionally, re-fetch car details to reflect changes in UI
        setCarOwners((prevCarOwners) => prevCarOwners.filter((carOwner) => carOwner._id !== id));
    } catch (err) {
        console.error('Error verifying car owner:', err);
        alert('Failed to verify car owner');
    }
}

const handleReject = async (id) => {
    try {
        await axios.post(`http://localhost:5050/api/admin/rejectCarOwner`, { id });
        alert('Car Owner rejected successfully!');
        // Optionally, re-fetch car details to reflect changes in UI
        setCarOwners((prevCarOwners) => prevCarOwners.filter((carOwner) => carOwner._id !== id));
    } catch (err) {
        console.error('Error rejecting car owner:', err);
        alert('Failed to reject car owner');
    }
}

const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = '/login';
}
  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-button" onClick={handleSidebarToggle}>✖️</button>
        <h2 className="sidebar-title">Menu</h2>
        <ul className="sidebar-menu">
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/carOwners">Car Owners</a></li>
          <li><a href="/customers">Customers</a></li>
          {/* <li><a href="/cars">Cars</a></li> */}
          <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="admin-dashboard">
        {/* Sidebar Toggle Button */}
        <button className="sidebar-toggle-button" onClick={handleSidebarToggle}>
          {sidebarOpen ? '✖️' : '🟰'}
        </button>

        <h1>Admin Dashboard</h1>
        <div className="tiles-container">
          <div className="tile">
            <h2>Commission Amount</h2>
            <p>${commissionAmount.toFixed(2)}</p>
          </div>
          <div className="tile">
            <h2>Total Car Owners</h2>
            <p>{carOwnersCount}</p>
          </div>
          <div className="tile">
            <h2>Total Customers</h2>
            <p>{customersCount}</p>
          </div>
          <div className="tile">
            <h2>Total Cars</h2>
            <p>{carsCount}</p>
          </div>
        </div>
        <div className="tiles-container">
          {/* Verify Car Owners */}
          {carOwners.length > 0 && (  // Render the tile only if there are unverified car owners
          <div className='tile'>
            <h2>Verify Car Owners</h2>
            <table>
              {carOwners.map(carOwner => (
                <tr key={carOwner._id}>
                  <td>Name: <span>{carOwner.firstName}</span><br />
                  <span>State ID:</span>
                  <img src={carOwner.stateID} alt={carOwner.firstName} className="car-image" />
                  <br />
                  <button className="verify-button" onClick={() =>handleVerify(carOwner._id)}>Verify</button>
                  &nbsp;&nbsp;
                  <button className="verify-button" onClick={() =>handleReject(carOwner._id)}>Reject</button>
                  </td>
                  </tr>
              )
              )}
              
            </table>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
