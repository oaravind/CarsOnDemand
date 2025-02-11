import React, { useState } from 'react';
import '../styles/ChangeAvailabilityModal.css';

function ChangeAvailabilityModal({ isOpen, onClose, onSubmit }) {
    const [newAvailableStartDate, setNewAvailableStartDate] = useState('');
    const [newAvailableStartTime, setNewAvailableStartTime] = useState('09:00 AM');
    const [newAvailableEndDate, setNewAvailableEndDate] = useState('');
    const [newAvailableEndTime, setNewAvailableEndTime] = useState('09:00 AM');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = () => {
        const availabilityData = {
            newAvailableStartDate,
            newAvailableStartTime,
            newAvailableEndDate,
            newAvailableEndTime
        };
        onSubmit(availabilityData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Change Availability</h2>
                <div className="form-group">
                    <label>New Available Start Date:</label>
                    <input
                        type="date"
                        value={newAvailableStartDate}
                        onChange={(e) => setNewAvailableStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Available Start Time:</label>
                    <select value={newAvailableStartTime} onChange={(e) => setNewAvailableStartTime(e.target.value)} required>
                        {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'].map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>New Available End Date:</label>
                    <input
                        type="date"
                        value={newAvailableEndDate}
                        onChange={(e) => setNewAvailableEndDate(e.target.value)}
                        required
                        min={newAvailableStartDate || new Date().toISOString().split("T")[0]}
                    />
                </div>
                <div className="form-group">
                    <label>New Available End Time:</label>
                    <select value={newAvailableEndTime} onChange={(e) => setNewAvailableEndTime(e.target.value)} required>
                        {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'].map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>
                <div className="modal-actions">
                    <button onClick={handleSubmit}>Submit</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ChangeAvailabilityModal;
