import React, { useState } from 'react';
import '../styles/EndTripModal.css';
import ImageUpload from './ImageUpload';

function EndTripModal({ isOpen, onClose, onSubmit, isInsuranceIncluded, fuelType }) {
    // Move all hook declarations to the top level of the component
    const [fuelLevel, setFuelLevel] = useState('');
    const [damageDescription, setDamageDescription] = useState('');
    const [damageCost, setDamageCost] = useState(0);
    const [imageUrls, setImageUrls] = useState([]); // This line was moved above the conditional return

    // If the modal is not open, return null
    if (!isOpen) {
        return null;
    }

    const handleImageUploadComplete = (uploadedImageUrls) => {
        console.log('Uploaded image URLs:', uploadedImageUrls);
        setImageUrls(uploadedImageUrls);
    };

    const handleSubmit = () => {
        const endTripDetails = { fuelLevel, damageDescription, damageCost, imageUrls };
        onSubmit(endTripDetails);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>End Trip Details</h2>
                <div className="form-group">
                    <label>Current Fuel Level:</label>
                {/* Display the fuel level based on the fuel type */}
                {fuelType !== 'Electric' ? (
                    <select value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)}>
                        <option value="Empty">Empty</option>
                        <option value="1/4">1/4</option>
                        <option value="1/2">1/2</option>
                        <option value="3/4">3/4</option>
                        <option value="Full">Full</option>
                    </select>):(<input type="number" name="gasLevel" max={100} 
                    maxLength={3}
                    value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)}
                        className="form-input"  
                        required
                        />)}
                </div>
                {!isInsuranceIncluded && (
                    <>
                <div className="form-group">
                    <label>Upload images:</label> Optional*
                    <ImageUpload
                        onUploadComplete={handleImageUploadComplete}
                        maxNumberOfFiles={5} // Allow up to 5 images
                        multiple={true}
                    />
                </div>
                <div className="form-group">
                    <label>Damage Description:</label>
                    <textarea
                        value={damageDescription}
                        onChange={(e) => setDamageDescription(e.target.value)}
                        placeholder="Describe any damages (if applicable)"
                    />
                </div>
                <div className="form-group">
                    <label>Estimated Damage Cost:</label>
                    <input
                        type="number"
                        value={damageCost}
                        onChange={(e) => setDamageCost(e.target.value)}
                        min="0"
                    />
                </div>
                </>
                )}
                <div className="action-buttons">
                    <button onClick={handleSubmit}>Submit End Trip</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default EndTripModal;
