import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import '../styles/style.css';
import ImageUpload from './ImageUpload';
import { states } from '../modules/CustomFunctions';
import { useNavigate } from 'react-router-dom';

const AddCar = () => {
    const navigate = useNavigate();
    const [car, setCar] = useState({
        owner: '',
        maker: '',
        model: '',
        year: '',
        licensePlate: '',
        noOfMiles: '',
        fuelType: 'Gas',
        gasLevel: '',
        location: '',
        availableStartDate: '',
        availableEndDate: '',
        pricePerDay: '',
        pricePerHour: '',
        insurancePerDay: '',
        images: '',
        description: '',
        features: '',
        maintenanceRecords: ''
    });
    const [location, setLocation] = useState({
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [imageUrls, setImageUrls] = useState([]);
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if the car owner is verified
    useEffect(() => {
        const checkVerificationStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const decoded = jwtDecode(token);
                const response = await axios.post(`http://localhost:5050/api/carOwner/checkStatus`, { id: decoded.id });

                // Assuming response contains a field called `verified` which indicates if the car owner is verified
                if (response.data.isVerified) {
                    setIsVerified(true);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error checking verification status:', error);
                setLoading(false);
            }
        };

        checkVerificationStatus();
    }, [navigate]);

    const handleImageUploadComplete = (uploadedImageUrls) => {
        console.log('Uploaded image URLs:', uploadedImageUrls);
        setImageUrls(uploadedImageUrls);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocation({
            ...location,
            [name]: value
        });
        setCar({
            ...car,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(car);
            const token = localStorage.getItem('token');
            const decoded = jwtDecode(token);
            car.owner = decoded.id;
            car.location = `${location.address}, ${location.city}, ${location.state}, ${location.zipCode}`;
            car.images = imageUrls;

            const response = await axios.post('http://localhost:5050/api/car/add', car);
            alert(response.data.message);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error adding car:', error);
        }
        console.log(car);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isVerified) {
        return (
            <div className="container">
                <h2 className="form-title">Add Car</h2>
                <p className="verification-warning">You can't create a car until the admin verifies you.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h2 className="form-title">Add Car</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div>
                    <label className='form-group'>Maker</label>
                    <input
                        type="text"
                        name="maker"
                        value={car.maker}
                        onChange={handleChange}
                        placeholder="Enter car maker"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Model</label>
                    <input
                        type="text"
                        name="model"
                        value={car.model}
                        onChange={handleChange}
                        placeholder="Enter car model"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Year</label>
                    <input
                        type="number"
                        name="year"
                        value={car.year}
                        onChange={handleChange}
                        placeholder="Enter car year"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>License Plate</label>
                    <input
                        type="text"
                        name="licensePlate"
                        value={car.licensePlate}
                        onChange={handleChange}
                        placeholder="Enter license plate"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>No Of Miles</label>
                    <input
                        type="number"
                        name="noOfMiles"
                        value={car.noOfMiles}
                        onChange={handleChange}
                        placeholder="Enter number of miles"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Fuel Type</label>
                    <select name="fuelType" value={car.fuelType} onChange={handleChange} className="form-input">
                        <option value="Gas">Gas</option>
                        <option value="Electric">Electric</option>
                        </select>
                </div>
                <div>
                    <label>Fuel Level</label>
                    {/*If fuelType is Electric, hide the gasLevel field */}
                    {car.fuelType === 'Electric' ? <input type="number" name="gasLevel" max={100} 
                    maxLength={3}
                    value={car.gasLevel}
                        onChange={handleChange}
                        className="form-input"  
                        required
                        /> :

                
                    <select
                        name="gasLevel"
                        value={car.gasLevel}
                        onChange={handleChange}
                        className="form-input"
                        required
                    >
                        <option value="">Select gas level</option>
                        <option value="Full">Full</option>
                        <option value="3/4">3/4</option>
                        <option value="1/2">1/2</option>
                        <option value="1/4">1/4</option>
                        <option value="Empty">Empty</option>
                    </select>
}
                </div>
                <div>
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={location.address}
                        onChange={handleChange}
                        placeholder="Enter location"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>City</label>
                    <input
                        type="text"
                        name="city"
                        value={location.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>State</label>
                    <select
                        name="state"
                        value={location.state}
                        onChange={handleChange}
                        className="form-input"
                        required
                    >
                        <option value="">Select state</option>
                        {states.map((state, index) => (
                            <option key={index} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Zip Code</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={location.zipCode}
                        onChange={handleChange}
                        placeholder="Enter zip code"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Available Start Date</label>
                    <input
                        type="date"
                        name="availableStartDate"
                        value={car.availableStartDate}
                        onChange={handleChange}
                        className="form-input"
                        min={new Date().toISOString().split("T")[0]}
                        required
                    />
                </div>
                <div>
                    <label>Available End Date</label>
                    <input
                        type="date"
                        name="availableEndDate"
                        value={car.availableEndDate}
                        onChange={handleChange}
                        className="form-input"
                        min={car.availableStartDate || new Date().toISOString().split("T")[0]}
                        required
                    />
                </div>
                <div>
                    <label>Price Per Day</label>
                    <input
                        type="number"
                        name="pricePerDay"
                        value={car.pricePerDay}
                        onChange={handleChange}
                        placeholder="Enter price per day"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Price Per Hour</label>
                    <input
                        type="number"
                        name="pricePerHour"
                        value={car.pricePerHour}
                        onChange={handleChange}
                        placeholder="Enter price per hour"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Insurance Per Day</label>
                    <input
                        type="number"
                        name="insurancePerDay"
                        value={car.insurancePerDay}
                        onChange={handleChange}
                        placeholder="Enter insurance per day"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Images</label>
                    <ImageUpload
                        onUploadComplete={handleImageUploadComplete}
                        maxNumberOfFiles={5} // Allow up to 5 images
                        multiple={true}
                    />
                </div>
                <div>
                    <label>Description</label>
                    <input
                        type="text"
                        name="description"
                        value={car.description}
                        onChange={handleChange}
                        placeholder="Enter description"
                        className="form-input"
                    />
                </div>
                <div>
                    <label>Features</label>
                    <input
                        type="text"
                        name="features"
                        value={car.features}
                        onChange={handleChange}
                        placeholder="Enter features"
                        className="form-input"
                        required
                    />
                </div>
                <div>
                    <label>Maintenance Records</label>
                    <input
                        type="text"
                        name="maintenanceRecords"
                        value={car.maintenanceRecords}
                        onChange={handleChange}
                        placeholder="Enter maintenance records"
                        className="form-input"
                    />
                </div>
                <button type="submit" className="form-button">Add Car</button>
            </form>
        </div>
    );
};

export default AddCar;
