import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/car-info.css';
import { calculateNumberOfDays, calculatePrice } from '../modules/CustomFunctions';

function CarInfo() {
    const { id } = useParams(); // Extracting 'id' from URL using useParams
    const customer = JSON.parse(localStorage.getItem('customer'));

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [includeInsurance, setIncludeInsurance] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [ownerAddress, setOwnerAddress] = useState(null);
    const [rentalDays, setRentalDays] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0); // State for selected image

    // Fetch car and owner information
    useEffect(() => {
        const fetchCarInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:5050/api/car/${id}`);
                setCar(response.data);
                
                const res = await axios.get(`http://localhost:5050/api/carOwner/address/${response.data.owner}`);
                setOwnerAddress(res.data);

                // Update customer with pick-up address in localStorage
                let pickUpAddress = `${res.data.address.toUpperCase()}, ${res.data.city.toUpperCase()}, ${res.data.state.toUpperCase()}, ${res.data.zipCode}.`;
                customer['pickUpAddress'] = pickUpAddress;
                localStorage.setItem('customer', JSON.stringify(customer));

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error fetching car details: ' + err);
                setLoading(false);
            }
        };

        fetchCarInfo();
    }, [id]);

    // Calculate rental days and estimated price after fetching data or if any inputs change
    useEffect(() => {
        if (customer && car) {
            let pickUpDateTime = customer.pickUpDateTime ? new Date(customer.pickUpDateTime) : new Date(`${customer.availableStartDate} ${customer.pickUpTime}`);
            let dropOffDateTime = customer.dropOffDateTime ? new Date(customer.dropOffDateTime) : new Date(`${customer.availableEndDate} ${customer.dropOffTime}`);
            
            const days = calculateNumberOfDays(pickUpDateTime, dropOffDateTime);
            setRentalDays(days);

            // Calculate the estimated price
            let price = calculatePrice(pickUpDateTime, dropOffDateTime, car.pricePerDay, car.pricePerHour, car.minimumHours);

            // Add insurance cost if selected
            if (includeInsurance) {
                price += car.insurancePerDay * days;
            }

            // Add security deposit (20% of the price)
            price += price * 0.2;

            setEstimatedPrice(price);
        }
    }, [car, customer, includeInsurance]);

    // Handle Checkout Process
    const handleCheckout = async (e) => {
        e.preventDefault(); // Prevent the default form submission
        try {
            // Convert the estimated price to cents
            const amountInCents = Math.round(estimatedPrice * 100);

            // Call backend to create the checkout session
            const response = await axios.post('http://localhost:5050/api/payment/checkout', {
                amount: amountInCents,
                email: customer?.email, // Pass the customer's email to the backend  
            });

            // Debugging: Check response
            console.log('Checkout Response:', response);
            customer['carId'] = id;
            customer['amount'] = estimatedPrice;
            customer['insurance'] = includeInsurance;
            localStorage.setItem('customer', JSON.stringify(customer));

            // Check if the response contains a URL and redirect to Stripe checkout page
            if (response.data && response.data.url) {
                window.location.href = response.data.url; // Redirect to Stripe checkout page
            } else {
                console.error('Error: No URL received for Stripe Checkout.');
            }
        } catch (err) {
            console.error('Error during checkout:', err);
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
                        {car.maker} {car.model}
                    </h2>
                    <div className="car-info-grid">
                        <div className="car-image-container">
                            <div className="main-image-container">
                                <img
                                    className="car-image"
                                    src={car.images[selectedImageIndex]}
                                    alt={`${car.maker} ${car.model} Image ${selectedImageIndex + 1}`}
                                />
                            </div>
                            <div className="thumbnail-container">
                                {car.images.map((image, index) => (
                                    <img
                                        key={index}
                                        className={`thumbnail-image ${index === selectedImageIndex ? 'selected' : ''}`}
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        onClick={() => setSelectedImageIndex(index)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="car-specs">
                            <p className="car-description">
                                <span>Description:</span> {car.description}
                            </p>
                            <p className="car-info">
                                <span>Number of Miles:</span> {car.noOfMiles}
                            </p>
                            <p className="car-info"><span>Features:</span></p>
                            <ol className="car-features">
                                {car.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ol>
                            <p className="car-info">
                                <span>Gas Level:</span> {car.gasLevel}
                            </p>
                            <p className="car-info">
                                <span>Maintenance Records:</span>
                                <ul>
                                    {car.maintenanceRecords.map((record, index) => (
                                        <li key={index}>
                                            <span>{new Date(record.date).toLocaleDateString()}</span> - {record.details}
                                        </li>
                                    ))}
                                </ul>
                            </p>
                            <p className="car-info">    
                                <span>Pick up Address:</span> {ownerAddress?.address.toUpperCase()}, {ownerAddress?.city.toUpperCase()}, {ownerAddress?.state.toUpperCase()}, {ownerAddress?.zipCode}
                            </p>
                            <p className="car-info">
                                <span>Pickup Date</span>: {customer.pickUpDateTime ? new Date(customer.pickUpDateTime).toLocaleString() : `${customer.availableStartDate} ${customer.pickUpTime}`}  
                            </p>

                            
                            <p className="car-info">
                                <span>Dropoff Date</span>: {customer.dropOffDateTime ? new Date(customer.dropOffDateTime).toLocaleString() : `${customer.availableEndDate} ${customer.dropOffTime}`}
                            </p>

                            <p className="car-info">
                                <span>Price Per Day:</span> ${car.pricePerDay}
                            </p>
                            <p className="car-info">
                                <span>Insurance Per Day:</span> ${car.insurancePerDay}
                            </p>
                            <div className="price-calculator">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={includeInsurance}
                                        onChange={(e) => setIncludeInsurance(e.target.checked)}
                                    />
                                    Include Insurance
                                </label>
                                <label> A 20% security deposit is included*</label>
                                <p className="estimated-price">
                                    Final Price: ${estimatedPrice.toFixed(2)}
                                </p>
                                <button
                                    className="button rent-button"
                                    onClick={handleCheckout}
                                >
                                    Rent Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="car-not-found">Car not found</p>
            )}
        </div>
    );
}

export default CarInfo;
