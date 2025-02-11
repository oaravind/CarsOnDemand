import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/rental.css';
import VerificationModal from './VerificationModal';
import DateTimeModal from './DateTimeModal';
import AlertModal from './AlertModal';
import EndTripModal from './EndTripModal';


function Rental() {
    const { id } = useParams(); // Extracting 'id' from URL using useParams
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isEndTripModalOpen, setIsEndTripModalOpen] = useState(false);
    

    // Handle Open End Trip Modal
    const handleOpenEndTripModal = () => {
        setIsEndTripModalOpen(true);
    };

    // Handle Close End Trip Modal
    const handleCloseEndTripModal = () => {
        setIsEndTripModalOpen(false);
    };

    // Handle Submit End Trip Form
    const handleEndTripSubmit = async (endTripDetails) => {
        try {
            // Send the end trip details to the backend
            await axios.post(`http://localhost:5050/api/carOwner/endRental`, {
                id,
                fuelType: rental.car.fuelType,
                ...endTripDetails,
            });
            //setRental({ ...rental, status: 'Pending Settlement' });
            alert('Trip has ended successfully.');
        } catch (err) {
            console.error('Error ending the trip:', err);
            alert('Failed to end the trip');
        } finally {
            setIsEndTripModalOpen(false);
        }
    };

    const handleOpenAlertModal = () => {
        setIsAlertModalOpen(true);
    };

    const handleCloseAlertModal = () => {
        setIsAlertModalOpen(false);
    };

    const handleAlertConfirm = () => {
        //alert("Confirmed!");
        try {
            axios.post(`http://localhost:5050/api/carOwner/cancelRental`, { id });
            //navigate('/rentals');
            setRental({ ...rental, status: 'Canceled' });
        }
        catch (err) {
            console.error('Error canceling the trip:', err);
            alert('Failed to cancel the trip');
        }

        setIsAlertModalOpen(false);
    };
    const handleOpenDateModal = () => {
        setIsDateModalOpen(true);
    };

    const handleCloseDateModal = () => {
        setIsDateModalOpen(false);
    };

    const handleDateSubmit = ({ date, time }) => {
        console.log("Selected Date:", date);
        console.log("Selected Time:", time);
        setDate(date);
        setTime(time);
        setIsDateModalOpen(false);
        handleOpenModal();
        //alert(`Date: ${date}\nTime: ${time}`);
    };


    // Fetch rental information from API
    useEffect(() => {
        const fetchRentalInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:5050/api/carOwner/rental/${id}`);
                setRental(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching rental details:', err);
                setError('Error fetching rental details: ' + err);
                setLoading(false);
            }
        };

        fetchRentalInfo();
    }, [id]);

    // Handle Starting the Trip
    const handleStartTrip = async () => {
        try {
            const response = await axios.post(`http://localhost:5050/api/rentals/start-trip/${id}`);
            alert('Trip started successfully!');
            setRental({ ...rental, status: 'in-progress' }); // Update rental status locally
        } catch (err) {
            console.error('Error starting the trip:', err);
            alert('Failed to start the trip');
        }
    };

    // Handle Canceling the Trip
    const handleCancelTrip = async () => {
        try {
            const response = await axios.post(`http://localhost:5050/api/rentals/cancel-trip/${id}`);
            alert('Trip canceled successfully!');
            navigate('/rentals'); // Redirect user to rentals list page
        } catch (err) {
            console.error('Error canceling the trip:', err);
            alert('Failed to cancel the trip');
        }
    };
    const handleOpenModal = () => {
        try {
            axios.post(`http://localhost:5050/api/carOwner/generateOTP`, { rentalId: id });
        }
        catch (err) {
            console.error('Error generating OTP:', err);
            alert('Failed to generate OTP');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleVerify = async (otp) => {
        console.log("Entered OTP:", otp);
        try {
            let response;
            if (rental.status === 'Booked') {
                response = await axios.post(`http://localhost:5050/api/carOwner/startRental`, { id, otp });

                setRental({ ...rental, status: 'Started' });
            } else if (rental.status === 'Started') {
                response = await axios.post(`http://localhost:5050/api/carOwner/extendRental`, { id, otp, date, time });
                setRental({ ...rental, status: 'Extended' });
                setRental({ ...rental, endDate: new Date(`${date} ${time}`) });

            } else if (rental.status === 'Extended') {
                response = await axios.post(`http://localhost:5050/api/carOwner/extendRental`, { id, otp, date, time });
                setRental({ ...rental, status: 'Extended' });
                setRental({ ...rental, endDate: new Date(`${date} ${time}`) });

            }



            alert(response.data.message);

        } catch (err) {
            console.error('Error verifying OTP:', err);
            alert('Failed to verify OTP');
        }
        //alert(`OTP Verified: ${otp}`);
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="rental-info-container">
            {rental ? (
                <div className="rental-details">
                    <h2 className="rental-title">
                        {rental.car?.maker} {rental.car?.model}
                    </h2>
                    <div className="rental-info-grid">
                        <div className="rental-image-container">
                            <img
                                className="rental-car-image"
                                src={rental.car?.images[0]}
                                alt={`${rental.car?.maker} ${rental.car?.model}`}
                            />
                        </div>
                        <div className="rental-specs">
                            <p className="rental-info">
                                <span>Rental Start Date:</span> {new Date(rental.startDate).toLocaleString()}
                            </p>
                            <p className="rental-info">
                                <span>Rental End Date:</span> {new Date(rental.endDate).toLocaleString()}
                            </p>
                            <p className="rental-info">
                                <span>Pick Up Location:</span> {rental.pickUpAddress}
                            </p>
                            <p className="rental-info">
                                <span>Drop Off Location:</span> {rental.dropOffAddress}
                            </p>
                            <p className="rental-info">
                                <span>Customer Name:</span> {rental.customer?.firstName}
                            </p>
                            <p className="rental-info">
                                <span>Customer Email:</span> {rental.customer?.email}
                            </p>
                            <p className="rental-info">
                                <span>Insurance Selected:</span> {rental.insurance > 0 ? 'Yes' : 'No'}
                            </p>
                            <p className="rental-info">
                                <span>Total Price Paid:</span> ${rental.totalCost.toFixed(2)}
                            </p>
                            <p className="rental-info">
                                <span>Deposit Amount:</span> ${rental.deposit.toFixed(2)}
                            </p>

                            {/* Buttons to Start or Cancel the Trip */}
                            <div className="action-buttons">
                                {rental.status === 'Booked' && (
                                    <>
                                        <button className="button start-button" onClick={handleOpenModal}>
                                            Start Trip
                                        </button>
                                        <button className="button cancel-button" onClick={handleOpenAlertModal}>
                                            Cancel Trip
                                        </button>
                                    </>)}

                                <VerificationModal
                                    isOpen={isModalOpen}
                                    onClose={handleCloseModal}
                                    onVerify={handleVerify}
                                />

                                {(rental.status === 'Started' || rental.status === 'Extended') && (
                                    <>

                                        {/* <button className="button" onClick={handleOpenDateModal}>
                                            Extend Trip
                                        </button> */}
                                        <button className="button" onClick={handleOpenEndTripModal}>
                                            End Trip
                                        </button>
                                    </>
                                )}
                                {(rental.status === 'Canceled') && (
                                    <button className='button cancel-button' disabled> Trip Canceled</button>
                                )}
                            </div>
                            <DateTimeModal
                                isOpen={isDateModalOpen}
                                onClose={handleCloseDateModal}
                                onSubmit={handleDateSubmit}
                            />
                            <AlertModal
                                isOpen={isAlertModalOpen}
                                message="Are you sure you want to cancel this trip? 100% Refund will be initiated to the customer."
                                onConfirm={handleAlertConfirm}
                                onCancel={handleCloseAlertModal}
                            />
                            <EndTripModal
                                isOpen={isEndTripModalOpen}
                                onClose={handleCloseEndTripModal}
                                onSubmit={handleEndTripSubmit}
                                isInsuranceIncluded={rental.insurance > 0}
                                fuelType={rental.car.fuelType}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <p className="rental-not-found">Rental not found</p>
            )}
        </div>
    );
}

export default Rental;
