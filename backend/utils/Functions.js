const crypto = require('crypto');
let otpStorage = {};  // This is temporary storage, in-memory
const ratePerKwh = 0.12; // Rate per kWh is $0.12
const fuelLevels = {
    'Empty': 0,
    '1/4': 1,
    '1/2': 2,
    '3/4': 3,
    'Full': 4
  };
  
  const costPerQuarterTank = 15; // Cost for each 1/4 tank is $15.00
  
  function calculateFuelCost(startingFuelLevel, endingFuelLevel, fuelType) {
    const startValue = fuelLevels[startingFuelLevel];
    const endValue = fuelLevels[endingFuelLevel];
   
  
    // if (startValue === undefined || endValue === undefined) {
    //   throw new Error('Invalid fuel level provided');
    // }
  
    const levelDifference = startValue - endValue;
  
    if (levelDifference <= 0) {
      // No cost if the level is the same or higher than the starting level
      return 0;
    }
    
    if (fuelType === 'Electric') {
        // Electric vehicle logic
        console.log('Electric vehicle logic:', startingFuelLevel, endingFuelLevel);
        const percentageUsed = parseInt(startingFuelLevel) - parseInt(endingFuelLevel); // Example: 0.8 (80%) - 0.5 (50%) = 30% or 0.3
        const kWhUsed = 50 * percentageUsed; // Energy consumed
        let cost = kWhUsed * ratePerKwh; // Cost of electricity
        cost = cost/100; // Convert to cents
        return cost.toFixed(2); // Return the calculated cost
      }
    // Calculate the cost based on the number of levels decreased
    const fuelCost = levelDifference * costPerQuarterTank;
    return fuelCost;
  }


// Generate OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999);  // Generates a 6-digit OTP
}

// Store OTP in memory for a limited time (use Redis for production)
function storeOTP(userId, otp) {
    otpStorage[userId] = otp;
    setTimeout(() => delete otpStorage[userId], 5 * 60 * 1000);  // Delete OTP after 5 mins
}

// Verify OTP
function verifyOTP(userId, otpInput) {
    return otpStorage[userId] && otpStorage[userId] === otpInput;
}

function extractLastSixCharacters(id) {
    if (typeof id !== 'string') {
        id = String(id);
    }
    if (id.length < 6) {
        throw new Error('Invalid ID');
    }
    return id.slice(-6);
}

function compareLastSixCharacters(id, lastSix) {
    if (typeof id !== 'string') {
        id = String(id);
    }
    if (typeof lastSix !== 'string') {
        lastSix = String(lastSix);
    }
    if (id.length < 6 || lastSix.length !== 6) {
        throw new Error('Invalid ID or lastSix');
    }
    return id.slice(-6) === lastSix;
}

const calculateNumberOfDays = (startDate, endDate) =>{
    // Convert startDate and endDate to Date objects if they are not already
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Ensure start date is before end date
    if (start > end) {
      throw new Error('Start date must be before end date');
    }
  
    // Calculate the difference in time
    const timeDifference = end.getTime() - start.getTime();
  
    // Convert time difference from milliseconds to days
    const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  
    return numberOfDays;
};


module.exports = {extractLastSixCharacters, compareLastSixCharacters, generateOTP, storeOTP, verifyOTP, calculateFuelCost, calculateNumberOfDays};

