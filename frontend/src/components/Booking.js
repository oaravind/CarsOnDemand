import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Booking.css';
import AlertModal from './AlertModal';

function Booking() {
    const { id } = useParams(); // Extracting 'id' from URL using useParams
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    // Handle Open Alert Modal for Cancel
    const handleOpenAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    // Handle Close Alert Modal
    const handleCloseAlertModal = () => {
        setIsAlertModalOpen(false);
    };

    // Handle Confirm Cancel Trip
    const handleAlertConfirm = async () => {
        try {
            await axios.post(`http://localhost:5050/api/user/cancelBooking`, { id });
            setBooking({ ...booking, status: 'Canceled' });
            alert('Booking has been canceled successfully.');
            navigate('/bookings'); // Redirect user to bookings list page
        } catch (err) {
            console.error('Error canceling the booking:', err);
            alert('Failed to cancel the booking');
        } finally {
            setIsAlertModalOpen(false);
        }
    };

    // Fetch booking information from API
    useEffect(() => {
        const fetchBookingInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:5050/api/CarOwner/rental/${id}`);
                setBooking(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching booking details:', err);
                setError('Error fetching booking details: ' + err);
                setLoading(false);
            }
        };

        fetchBookingInfo();
    }, [id]);

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="booking-info-container">
            {booking ? (
                <div className="booking-details">
                    <h2 className="booking-title">
                        {booking.car?.maker} {booking.car?.model}
                    </h2>
                    <div className="booking-info-grid">
                        <div className="booking-image-container">
                            <img
                                className="booking-car-image"
                                src={booking.car?.images[0]}
                                alt={`${booking.car?.maker} ${booking.car?.model}`}
                            />
                        </div>
                        <div className="booking-specs">
                            <p className="booking-info">
                                <span>Booking Start Date:</span> {new Date(booking.startDate).toLocaleString()}
                            </p>
                            <p className="booking-info">
                                <span>Booking End Date:</span> {new Date(booking.endDate).toLocaleString()}
                            </p>
                            <p className="booking-info">
                                <span>Pick Up Location:</span> {booking.pickUpAddress}
                            </p>
                            <p className="booking-info">
                                <span>Drop Off Location:</span> {booking.dropOffAddress}
                            </p>
                            <p className="booking-info">
                                <span>Total Price Paid:</span> ${booking.totalCost.toFixed(2)}
                            </p>
                            <p className="booking-info">
                                <span>Deposit Amount:</span> ${booking.deposit.toFixed(2)}
                            </p>
                            <p className="booking-info">
                                <span>Insurance Selected:</span> {booking.insurance > 0 ? 'Yes' : 'No'}
                            </p>

                            {/* Button to Cancel the Trip */}
                            <div className="action-buttons">
                                {booking.status === 'Booked' && (
                                    <button className="button cancel-button" onClick={handleOpenAlertModal}>
                                        Cancel Booking
                                    </button>
                                )}
                                {(booking.status === 'Canceled') && (
                                    <button className='button cancel-button' disabled> Booking Canceled</button>
                                )}
                            </div>

                            {/* Cancel Booking Alert Modal */}
                            <AlertModal
                                isOpen={isAlertModalOpen}
                                message="Are you sure you want to cancel this booking? Security Deposit amount will not be refunded."
                                onConfirm={handleAlertConfirm}
                                onCancel={handleCloseAlertModal}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <p className="booking-not-found">Booking not found</p>
            )}
        </div>
    );
}

export default Booking;
