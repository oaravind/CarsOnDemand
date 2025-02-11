import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CarDetails.css';
import ChangeAvailabilityModal from './ChangeAvailabilityModal'; // Importing the new modal
import { convertUTCToLocal } from '../modules/CustomFunctions';
function CarDetails() {
    const { id } = useParams(); // Extracting 'id' from URL using useParams
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch car information from API
    useEffect(() => {
        const fetchCarInfo = async () => {
            try {
                console.log("Fetching car info for ID:", id);  // Debug log to see which ID is being fetched
                const response = await axios.get(`http://localhost:5050/api/car/${id}`);

                if (response && response.data) {
                    console.log("API response data:", response.data);  // Log to see the response data
                    setCar(response.data); // Update the car state if response is successful
                } else {
                    throw new Error("Invalid response structure or missing data");
                }
                
            } catch (err) {
                console.error('Error fetching car details:', err);
                setError('Error fetching car details: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCarInfo();
    }, [id]);

    // Handle Modal Opening
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Handle Modal Closing
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Handle Availability Change Submission
    const handleChangeAvailabilitySubmit = async (availabilityData) => {
        try {
            await axios.post(`http://localhost:5050/api/car/changeAvailability/${id}`, availabilityData);
            alert('Car availability updated successfully!');
            // Optionally, re-fetch car details to reflect changes in UI
            setCar((prevCar) => ({
                ...prevCar,
                availableStartDate: availabilityData.newAvailableStartDate,
                availableEndDate: availabilityData.newAvailableEndDate
            }));
        } catch (err) {
            console.error('Error updating availability:', err);
            alert('Failed to update car availability');
        } finally {
            setIsModalOpen(false);
        }
    };

    // Handle Unlisting Car
    const handleUnlistCar = async () => {
        try {
            const confirmUnlist = window.confirm("Are you sure you want to unlist this car?");
            if (confirmUnlist) {
                await axios.post(`http://localhost:5050/api/car/delete`, { id });
                alert('Car has been unlisted successfully.');
                navigate('/cars'); // Redirect back to cars list after unlisting
            }
        } catch (err) {
            console.error('Error unlisting car:', err);
            alert('Failed to unlist the car');
        }
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="car-info-container">
            {car ? (
                <div className="car-details">
                    <h2 className="car-title">
                        {car.maker} {car.model} ({car.year})
                    </h2>
                    <div className="car-info-grid">
                        <div className="car-image-container">
                            <img
                                className="car-info-image"
                                src={car.images[0]}
                                alt={`${car.maker} ${car.model}`}
                            />
                        </div>
                        <div className="car-specs">
                            <p className="car-info">
                                <span>Price per Day:</span> ${car.pricePerDay}
                            </p>
                            <p className="car-info">
                                <span>Price per Hour:</span> ${car.pricePerHour}
                            </p>
                            <p className="car-info">
                                <span>Fuel Type:</span> {car.fuelType}
                            </p>

                            {/* Displaying available date-time ranges */}
                            <h4>Available Date-Time Ranges</h4>
                            {car.availableRanges.map((range, index) => (
                                <p key={index} className="car-info">
                                    <span>Start Date:</span> {convertUTCToLocal(range.startDateTime)}<br/>
                                    <span>End Date:</span> {convertUTCToLocal(range.endDateTime)}
                                </p>
                            ))}
                            <h4>Bookings</h4>
                            {car.bookings.map((booking, index) => (
                                <p key={index} className="car-info">
                                    <span>Start Date:</span> {convertUTCToLocal(booking.startDateTime)}<br/>
                                    <span>End Date:</span> {convertUTCToLocal(booking.endDateTime)}
                                    {/* <span>Total Price:</span> ${booking.totalPrice} */}
                                </p>
                            ))}


                            {/* <p className="car-info">
                            <span>Available Start Date: {convertUTCToLocal(car.availableRanges.startDate)}</span>
                            <span>Available End Date: {convertUTCToLocal(car.availableRanges.endDate)}</span>
                            </p> */}
                           
                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <button className="button" onClick={handleOpenModal}>
                                    Change Availability
                                </button>
                                {/* <button className="button unlist-button" onClick={handleUnlistCar}>
                                    Unlist Car
                                </button> */}
                            </div>
                        </div>
                    </div>
                    <ChangeAvailabilityModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSubmit={handleChangeAvailabilitySubmit}
                    />
                </div>
            ) : (
                <p className="car-not-found">Car not found</p>
            )}
        </div>
    );
}

export default CarDetails;
