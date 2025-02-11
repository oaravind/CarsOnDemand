import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import '../styles/Dispute.css'; // Importing CSS for styling

function Dispute() {
  const { settlementToken } = useParams();
  const [rentalDetails, setRentalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const decodedToken = jwtDecode(settlementToken);
      console.log('Decoded Token:', decodedToken);

      // Fetch rental details using rentalId from the token
      const fetchRentalDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:5050/api/CarOwner/rental/${decodedToken.rentalId}`);
          setRentalDetails({ ...response.data, ...decodedToken }); // Merge token data with rental details
          setLoading(false);
          console.log('Rental Details:', rentalDetails);
        } catch (fetchError) {
          console.error('Error fetching rental details:', fetchError);
          setError('Could not retrieve rental details.');
          setLoading(false);
        }
      };

      fetchRentalDetails();
    } catch (err) {
      console.error('Error decoding token or fetching rental details:', err);
      setError('Invalid or expired settlement token.');
      setLoading(false);
    }
  }, [settlementToken]);

  const handleApproval = async () => {
    try {
      await axios.post(
        `http://localhost:5050/api/CarOwner/approveSettlement`,
        {},
        {
          headers: {
            Authorization: `Bearer ${settlementToken}`,
          },
        }
      );
      alert('Settlement approved successfully');
      navigate('/bookings');
      //
    } catch (err) {
      console.error('Error approving settlement:', err);
      alert('Failed to approve settlement');
    }
  };

  const handleDispute = async () => {
    try {
      await axios.post(
        `http://localhost:5050/api/CarOwner/disputeSettlement`,
        {},
        {
          headers: {
            Authorization: `Bearer ${settlementToken}`,
          },
        }
      );
      alert('Dispute initiated successfully. Admin will review the case.');
      navigate('/bookings');
    } catch (err) {
      console.error('Error disputing settlement:', err);
      alert('Failed to dispute settlement');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="settlement-container">
      <h2>Settlement Details for {rentalDetails.car.maker} {rentalDetails.car.model}</h2>
      <div className="settlement-details">
        <p><span>Start Date:</span> {new Date(rentalDetails.startDate).toLocaleString()}</p>
        <p><span>End Date:</span> {new Date(rentalDetails.endDate).toLocaleString()}</p>
        <p><span>Fuel Level at Return:</span> {rentalDetails.fuelLevel}</p>
        <p><span>Fuel Cost:</span> {rentalDetails.fuelCost}</p>
        <p><span>Damage Description:</span> {rentalDetails.damageDescription}</p>
        <p><span>Damage Cost:</span> ${rentalDetails.damageCost}</p>
        <div className="images-container">
          <p><span>Images:</span></p>
          {rentalDetails.imageUrls && rentalDetails.imageUrls.length > 0 ? (
            rentalDetails.imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Damage ${index + 1}`} className="damage-image" />
            ))
          ) : (
            <span> None</span>
          )}
        </div>
        <h3>Billing Summary:</h3>
        <p><span>Deposit Amount:</span> ${rentalDetails.deposit.toFixed(2)}</p>
        <p><span>Total Charges: </span>${rentalDetails.totalCharges}</p>
        <p><span>Total Amount Paid:</span> ${rentalDetails.totalCost.toFixed(2)}</p>
        <p><span>Settlement Status:</span> {rentalDetails.isChargeBack ? 'Chargeback will be initiated.' : 'Eligible for Refund!'}</p>
        <p><span> {rentalDetails.isChargeBack ? (`Deducted Amount is : ${(rentalDetails.totalCharges-rentalDetails.deposit).toFixed(2)}` ):(`Refund Amount: ${(rentalDetails.deposit - rentalDetails.totalCharges).toFixed(2)}`)} </span></p>
        <div className="settlement-actions">
          <button onClick={handleApproval} className="approve-button">Approve Settlement</button>
          {/* <button onClick={handleDispute} className="dispute-button">Dispute Settlement</button> */}
        </div>
      </div>
    </div>
  );
}

export default Dispute;
