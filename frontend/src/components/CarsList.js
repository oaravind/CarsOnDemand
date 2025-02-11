import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CarsList.css';
import jwtDecode from 'jwt-decode';
import { convertUTCToLocal } from '../modules/CustomFunctions';

function CarsList() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    //const username = decoded.username;
    const userId = decoded.id;
  

    // Fetch cars information from API
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axios.post('http://localhost:5050/api/car/all', {owner:userId});
                setCars(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching cars:', err);
                setError('Error fetching cars: ' + err);
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="cars-list-container">
            <h2 className="cars-list-title">Your Cars</h2>
            <div className="add-car-button-container">
                <button className="button" onClick={() => navigate('/addCar')}>Add a Car</button>
            </div>
            <div className="cars-list">
                {cars.length > 0 ? (
                    cars.map(car => (
                        <div key={car._id} className="card car-card" onClick={() => navigate(`/cars/${car._id}`)}>
                            <div className="car-card-content">
                                <img src={car.images[0]} alt={car.maker} className="car-image" />
                                <div className="car-details">
                                    <h3>{car.maker} {car.model}</h3>
                                    <p>Price per day: ${car.pricePerDay}</p>
                                    <p>Available Start Date: {convertUTCToLocal(car.availableRanges.startDate)}</p>
                                    <p>Available End Date: {convertUTCToLocal(car.availableRanges.endDate)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-cars">No cars found. Add a car to get started!</p>
                )}
            </div>
        </div>
    );
}

export default CarsList;
