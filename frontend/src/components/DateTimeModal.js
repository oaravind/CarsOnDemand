import React, { useState } from "react";
import "../styles/DateTimeModal.css";

function DateTimeModal({ isOpen, onClose, onSubmit }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleSubmit = () => {
    if (!date || !time) {
      alert("Please select both date and time.");
      return;
    }
    onSubmit({ date, time });
    onClose();
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  return isOpen ? (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Select Extended Date and Time</h3>
        <div className="modal-form">
          {/* Date Input */}
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
            min={getTodayDate()} // Disable dates before today
          />

          {/* Time Dropdown */}
          <label htmlFor="time">Time:</label>
          <select id="time" value={time} onChange={handleTimeChange}>
            <option value="">Select Time</option>
            {Array.from({ length: 13 }, (_, i) => {
              const hour = 9 + i;
              const period = hour < 12 ? "AM" : "PM";
              const formattedHour = hour > 12 ? hour - 12 : hour;
              return (
                <option key={i} value={`${formattedHour}:00 ${period}`}>
                  {`${formattedHour}:00 ${period}`}
                </option>
              );
            })}
          </select>
        </div>

        <div className="modal-actions">
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default DateTimeModal;
