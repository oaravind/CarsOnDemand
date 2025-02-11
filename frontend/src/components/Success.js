import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Success = () => {
    const [statusMessage, setStatusMessage] = useState("Processing your payment... Please wait."); // Initial message for user
    const [isFinalStatus, setIsFinalStatus] = useState(false); // New state to mark when a final status is achieved

    useEffect(() => {
        // Get customer details from localStorage
        const customer = JSON.parse(localStorage.getItem('customer'));
        const carId = customer?.carId; // Assume 'carId' is the ID of the rented car
        let pickUpDateTime = customer?.pickUpDateTime;
        let dropOffDateTime = customer?.dropOffDateTime;

        // If pickUpDateTime is null, try to create it using availableStartDate and pickUpTime
        if (!pickUpDateTime && customer?.availableStartDate && customer?.pickUpTime) {
            pickUpDateTime = new Date(`${customer.availableStartDate} ${customer.pickUpTime}`);
        } else {
            pickUpDateTime = new Date(pickUpDateTime);
        }
        // If dropOffDateTime is null, try to create it using availableEndDate and dropOffTime
        if (!dropOffDateTime && customer?.availableEndDate && customer?.dropOffTime) {
            dropOffDateTime = new Date(`${customer.availableEndDate} ${customer.dropOffTime}`);
        } else {
            dropOffDateTime = new Date(dropOffDateTime);
        }
        // Get session_id from URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        // Add session_id to the customer object
        customer.sessionId = sessionId;
        customer.pickUpDateTime = pickUpDateTime;
        customer.dropOffDateTime = dropOffDateTime;
        const newAvailableStartDate = customer?.availableEndDate;

        if (carId && newAvailableStartDate) {
            // Make the request to update the availableStartDate for the car
            axios
                .post('http://localhost:5050/api/payment/success-flow', {
                    customer,
                })
                .then((response) => {
                    // If the backend responds with success
                    setStatusMessage('Payment Successful! Your car rental order has been successfully processed.');
                    setIsFinalStatus(true); // Mark the final status as achieved
                    console.log('Car availability updated:', response.data);
                })
                .catch((error) => {
                    // Only update the status if we haven't already marked the transaction as successful
                    if (!isFinalStatus) {
                        if (error.response && error.response.status === 409) {
                            setStatusMessage('Payment was already processed successfully. Your car rental order is confirmed.');
                            setIsFinalStatus(true); // Mark the final status as achieved
                        } else {
                            setStatusMessage('There was an issue completing your payment. Please contact support for more information.');
                        }
                    }
                    console.error('Error updating car availability:', error);
                });
        } else {
            setStatusMessage('Invalid booking data. Please contact support.');
            setIsFinalStatus(true);
        }
    }, [isFinalStatus]); // Added isFinalStatus to dependency to prevent further updates if success has already been achieved

    return (
        <div className="main-content">
            <h2>{statusMessage}</h2>
            {statusMessage.includes('successful') && (
                <p>You will receive an email confirmation shortly.</p>
            )}
            <button className='button' onClick={() => window.location.replace('http://localhost:3000/bookings')}>Go back to Home</button>
        </div>
    );
};

export default Success;
