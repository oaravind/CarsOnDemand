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

const calculatePrice = (pickUpTime, dropOffTime, pricePerDay, pricePerHour, minimumHours) => {
    const pickUp = new Date(pickUpTime);
    const dropOff = new Date(dropOffTime);
    console.log('Pickup:', pickUpTime);
    console.log('Dropoff:', dropOffTime);
    // Calculate the difference in hours
    const diffInMs = dropOff - pickUp;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let price = 0;

    // Full days calculation
    if (diffInDays >= 1) {
        price += diffInDays * pricePerDay;
    }

    // Remaining hours calculation
    const remainingHours = diffInHours % 24;
    if (remainingHours > 0) {
        if (remainingHours >= 12) {
            // Consider as a full day if more than 12 hours
            price += pricePerDay;
        } else {
            // Charge hourly
            price += Math.max(remainingHours, minimumHours) * pricePerHour;
        }
    }

    return price;
};

//Write a function to convert UTC date to local date
const convertUTCToLocal = (utcDate) => {
  const localDate = new Date(utcDate);
  return localDate.toLocaleString();
};

//create an array with US states
const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export { calculateNumberOfDays, calculatePrice, convertUTCToLocal, states }; 