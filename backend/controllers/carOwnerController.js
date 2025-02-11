const { Query } = require('mongoose');
const Car = require('../models/Car');
const CarOwner = require('../models/CarOwner');
const jwt = require('jsonwebtoken');
const Rental = require('../models/Rental');
//const { compareLastSixCharacters } = require('../utils/Functions');
const { sendEmail } = require('../utils/mailer');
const { refundPayment, chargeCustomer } = require('../utils/StripeOperations');
const Payment = require('../models/Payment');
const { sendSettlementEmail } = require('../utils/mailer');
const { calculateFuelCost } = require('../utils/Functions');
const Admin = require('../models/Admin');

const crypto = require('crypto');
const { send } = require('process');
let otpStorage = {};  // This is temporary storage, in-memory

// Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999);  // Generates a 6-digit OTP
}
// Store OTP in memory for a limited time (use Redis for production)
function storeOTP(userId, otp) {
  //console.log('Storing OTP:', userId,' : ', otp);
  otpStorage[userId] = otp;
  setTimeout(() => delete otpStorage[userId], 5 * 60 * 1000);  // Delete OTP after 5 mins
}
// Verify OTP
function verifyOTP(userId, otpInput) {

  //console.log('OTP Storage:', otpStorage);
  return otpStorage[userId] && otpStorage[userId] === parseInt(otpInput);
}

exports.checkStatus = async (req, res) => {
  const { id } = req.body;
  try {
    const carOwner = await CarOwner.findById(id);
    if (!carOwner) {
      return res.status(404).json({ error: 'Car owner not found' });
    }
    if (carOwner.isVerified) {
      res.status(200).json({ message: 'Car owner is verified', isVerified: true });
    } else {
      res.status(200).json({ message: 'Car owner is not verified', isVerified: false });
    }
  } catch (err) {
    res.status(400).json({ error: 'Error fetching car owner status: ' + err.message });
  }
};




//Getting address of car owner by car owner id
exports.getCarOwnerAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const carOwner = await CarOwner.findById(id);
    if (!carOwner) {
      return res.status(404).json({ error: 'Car owner not found' });
    }
    res.status(200).json({ _id: carOwner._id, address: carOwner.address, city: carOwner.city, state: carOwner.state, zipCode: carOwner.zipCode });
  } catch (err) {
    res.status(400).json({ error: 'Error fetching car owner address: ' + err.message });
  }
};


// Getting rentals of a car owner
exports.getCarOwnerRentals = async (req, res) => {
  try {
    const carOwnerId = req.body.owner; // Assuming the car owner ID is provided in the request params
    console.log('Fetching rentals for car owner:', carOwnerId);
    // Step 1: Find all cars owned by this car owner
    const cars = await Car.find({ owner: carOwnerId });

    if (cars.length === 0) {
      return res.status(404).json({ message: 'No cars found for the specified owner.' });
    }

    // Extract the car IDs from the result
    const carIds = cars.map(car => car._id);

    // Step 2: Find all rentals associated with these car IDs
    const rentals = await Rental.find({ car: { $in: carIds } })
      .populate('car') // Optional: Populate car details if needed
      .populate('customer') // Optional: Populate customer details if needed

    if (rentals.length === 0) {
      return res.status(404).json({ message: 'No rentals found for the specified car owner.' });
    }

    res.status(200).json(rentals);
  } catch (err) {
    console.error('Error fetching car owner rentals:', err);
    res.status(500).json({ error: 'Failed to fetch car owner rentals.' });
  }
};

// Fetch Rental by ID
exports.getRentalById = async (req, res) => {
  const rentalId = req.params.id;
  try {
    const rental = await Rental.findById(rentalId)
      .populate('car') // Populate car details with maker, model, and images
      .populate('customer'); // Populate customer details with name and email

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    res.status(200).json(rental);
  } catch (err) {
    console.error('Error fetching rental details:', err);
    res.status(500).json({ error: 'Failed to fetch rental details' });
  }
};

exports.startRental = async (req, res) => {
  const { id, otp } = req.body;
  try {
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    console.log('Starting rental:', rental.customer, 'otp: ', otp);
    let verifyOtp = verifyOTP(rental.customer, otp);
    if (!verifyOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    rental.status = 'Started';
    rental.startDate = new Date();
    await rental.save();

    res.status(200).json({ message: 'Rental started successfully' });
  } catch (err) {
    console.error('Error starting rental:', err);
    res.status(500).json({ error: 'Failed to start rental' });
  }
}

exports.extendRental = async (req, res) => {
  const { id, otp, date, time } = req.body;
  try {
    const extendedDate = new Date(`${date} ${time}`);
    console.log('Extending rental:', extendedDate);
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    let verifyOtp = verifyOTP(rental.customer, otp);
    if (!verifyOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    rental.endDate = new Date(extendedDate);
    rental.status = 'Extended';
    await rental.save();

    res.status(200).json({ message: 'Rental extended successfully' });
  } catch (err) {
    console.error('Error extending rental:', err);
    res.status(500).json({ error: 'Failed to extend rental' });
  }
}

exports.cancelRental = async (req, res) => {
  const { id } = req.body;
  try {
    const rental = await Rental.findById(id).populate('car').populate('customer');
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    console.log('Canceling rental:', rental);

    const payment = await Payment.findOne({ rental: id });
    if (payment) {
      //     // Refund the amount to the customer
      //     // Implement refund logic here
      console.log('Refunding payment:', rental.totalCost);
      const refund = await refundPayment(payment.paymentIntentId, rental.totalCost * 100); // Convert to cents
      console.log('Refund:', refund);
      sendEmail(rental.customer.email, 'Rental Cancellation', `We regret to inform you that your rental has been canceled. The amount of $${rental.totalCost} has been refunded to your account. Please allow 3-5 business days for the refund to reflect in your account. \nThank you for using our service.\n\nRegards,\nCars on Demand!`);

    }
    rental.status = 'Canceled';
    rental.car.availableStartDate = new Date();
    await rental.car.save();
    await rental.save();

    res.status(200).json({ message: 'Rental canceled successfully' });
  } catch (err) {
    console.error('Error canceling rental:', err);
    res.status(500).json({ error: 'Failed to cancel rental' });
  }
}

exports.endRental = async (req, res) => {
  const { id, fuelLevel, damageDescription, damageCost, imageUrls, fuelType } = req.body;
  console.log('End Trip Details:', fuelLevel, ' : ', damageDescription, ' : ', damageCost, ' : ', imageUrls, ' : ', fuelType);
  console.log('Rental ID:', id);
  try {
    const rental = await Rental.findById(id).populate('car').populate('customer');
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    console.log('Ending rental:', rental);

    let fuelCost = calculateFuelCost(rental.car.gasLevel, fuelLevel, fuelType);
    console.log('Fuel Cost:', fuelCost);
    let totalCharges = parseFloat(fuelCost) + parseFloat(damageCost)
    let isChargeBack = false;
    if (totalCharges > rental.deposit) {
      isChargeBack = true;
    }
    // Create JWT with rental details
    const tokenPayload = {
      rentalId: rental._id,
      fuelLevel,
      damageDescription,
      damageCost: parseInt(damageCost),
      carId: rental.car._id,
      customerId: rental.customer._id,
      carImages: imageUrls, // Add URLs for images, if any
      fuelCost: parseInt(fuelCost),
      totalCharges: parseInt(fuelCost) + parseInt(damageCost),
      //deposit: rental.deposit,
      isChargeBack

    };


    const payment = await Payment.findOne({ rental: rental._id });

    if (rental.deposit > totalCharges) {
      // Refund the excess amount to the customer
      // Implement refund logic here
      const refundAmount = (rental.deposit - totalCharges).toFixed(2);
      console.log('Refunding excess amount:', refundAmount);

      if (payment) {
        const refund = await refundPayment(payment.paymentIntentId, refundAmount * 100); // Convert to cents
        console.log('Refund:', refund);

      }
    }
    else if (rental.deposit < totalCharges) {
      // Charge the customer for the remaining amount
      // Implement charge logic here
      const chargeAmount = (totalCharges - rental.deposit).toFixed(2);
      console.log('Charging remaining amount:', chargeAmount);
      // Implement charge logic here  
      const newPayment = await chargeCustomer(payment.customer, parseInt(chargeAmount * 100)); // Convert to cents
      console.log('New Payment:', newPayment);
      //payment.sessionId = newPayment.paymentIntentId;
    }


    //Get Car Owner
    const carOwner = await CarOwner.findById(rental.car.owner);
    console.log('TotalCharges: ',totalCharges,'Type', typeof(totalCharges), ' : ', typeof(rental.commissionAmount));
    // Update car owner balance
    let balance = parseFloat(carOwner.balance) || 0; // Ensure balance is a number
balance += parseFloat(totalCharges) || 0;
balance += parseFloat(rental.totalCost - rental.commissionAmount) || 0;
carOwner.balance = parseFloat(balance.toFixed(2)); // Ensure balance is saved as a number
await carOwner.save();


    //Update Admin Balance
    const admin = await Admin.findOne({ email: 'asrithkrishna2000@gmail.com' });
    admin.commissionBalance += rental.commissionAmount;
    admin.save();

    // Update car availability
    //rental.car.availableStartDate = (new Date()) + 1;
    //rental.car.availableStartDate = new Date(new Date().setDate(new Date().getDate() + 1));
    await rental.car.save();

    // Send email to the customer confirming the settlement
    //sendEmail(rental.customer.email, 'Rental Settlement Approved', `We have received your settlement for the rental of ${rental.car.maker} ${rental.car.model}. Thank you for using our service. \n\nRegards,\nCars on Demand!`);




    console.log('Token Payload:', tokenPayload);
    const settlementToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '3d' });
    const settlementLink = `http://localhost:3000/settlement/${settlementToken}`;

    // Send email to the customer with the settlement link
    const customerEmail = rental.customer.email; // Assuming you can access customer email
    await sendSettlementEmail(customerEmail, settlementLink);
    // Update rental status to 'Completed'
    rental.status = 'Completed';
    await rental.save();
    res.status(200).json({ message: 'Settlement link sent to the customer successfully.' });

  } catch (err) {
    console.error('Error ending rental:', err);
    res.status(500).json({ error: 'Failed to end rental' });
  }
};

exports.approveSettlement = async (req, res) => {
  const settlementToken = req.headers.authorization?.split(' ')[1];
  try {
    const decodedToken = jwt.verify(settlementToken, process.env.JWT_SECRET);
    console.log('Decoded Token:', decodedToken);

    const rental = await Rental.findById(decodedToken.rentalId).populate('customer').populate('car');
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    if (rental.status === 'Completed') {
      return res.status(400).json({ error: 'Settlement already approved' });
    }

    const payment = await Payment.findOne({ rental: rental._id });

    if (rental.deposit > decodedToken.totalCharges) {
      // Refund the excess amount to the customer
      // Implement refund logic here
      const refundAmount = (rental.deposit - decodedToken.totalCharges).toFixed(2);
      console.log('Refunding excess amount:', refundAmount);

      if (payment) {
        const refund = await refundPayment(payment.paymentIntentId, refundAmount * 100); // Convert to cents
        console.log('Refund:', refund);

      }
    }
    else if (rental.deposit < decodedToken.totalCharges) {
      // Charge the customer for the remaining amount
      // Implement charge logic here
      const chargeAmount = (decodedToken.totalCharges - rental.deposit).toFixed(2);
      console.log('Charging remaining amount:', chargeAmount);
      // Implement charge logic here  
      const newPayment = await chargeCustomer(payment.customer, parseInt(chargeAmount * 100)); // Convert to cents
      console.log('New Payment:', newPayment);
      //payment.sessionId = newPayment.paymentIntentId;
    }
    // Update rental status to 'Completed'
    rental.status = 'Completed';
    await rental.save();

    //Get Car Owner
    const carOwner = await CarOwner.findById(rental.car.owner);
    // Update car owner balance
    carOwner.balance += decodedToken.totalCharges;
    carOwner.balance += (rental.totalCost - rental.commissionAmount).toFixed(2);
    carOwner.save();

    //Update Admin Balance
    const admin = await Admin.findOne({ email: 'asrithkrishna2000@gmail.com' });
    admin.commissionBalance += rental.commissionAmount;
    admin.save();

    // Update car availability
    //rental.car.availableStartDate = (new Date()) + 1;
    rental.car.availableStartDate = new Date(new Date().setDate(new Date().getDate() + 1));
    await rental.car.save();

    // Send email to the customer confirming the settlement
    sendEmail(rental.customer.email, 'Rental Settlement Approved', `We have received your settlement for the rental of ${rental.car.maker} ${rental.car.model}. Thank you for using our service. \n\nRegards,\nCars on Demand!`);

    res.status(200).json({ message: 'Settlement approved successfully.' });
  } catch (err) {
    console.error('Error approving settlement:', err);
    res.status(500).json({ error: 'Failed to approve settlement.' });
  }
};

exports.disputeSettlement = async (req, res) => {
  const settlementToken = req.headers.authorization?.split(' ')[1];
  try {
    const decodedToken = jwt.verify(settlementToken, process.env.JWT_SECRET);
    console.log('Decoded Token:', decodedToken);

    const rental = await Rental.findById(decodedToken.rentalId).populate('customer').populate('car');
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Update rental status to 'Disputed'
    rental.status = 'Disputed';
    await rental.save();

    const settlementLink = `http://localhost:3000/dispute/${settlementToken}`;
    // Send email to the customer confirming the dispute
    sendEmail(rental.customer.email, 'Rental Settlement Dispute', `We have received your dispute for the rental of ${rental.car.maker} ${rental.car.model}. Our team will review the case and get back to you shortly. Thank you for using our service. \n\nRegards,\nCars on Demand!`);
    sendEmail('asrithkrishna2000@gmail.com', 'Rental Settlement Dispute', `A dispute has been initiated for the rental of ${rental.car.maker} ${rental.car.model}. Please review the case and take necessary action. 
        Please follow the link : ${settlementLink} to review the case. \n\nRegards,\nCars on Demand!`);

    res.status(200).json({ message: 'Dispute initiated successfully. Admin will review the case.' });
  } catch (err) {
    console.error('Error disputing settlement:', err);
    res.status(500).json({ error: 'Failed to dispute settlement.' });
  }
}

exports.generateOTP = async (req, res) => {
  const { rentalId } = req.body;
  try {
    const rental = await Rental.findById(rentalId).populate('customer');
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    const otp = generateOTP();
    storeOTP(rental.customer._id, otp);

    // Send OTP to customer via email or SMS
    sendEmail(rental.customer.email, 'OTP for Rental Verification', `
        Your OTP is: ${otp}. EXPIRES IN 5 MINUTES. 
        Please do share this OTP with the car owner to start/extend the rental only.
        Do not share this OTP with anyone else for security reasons.
        Thank you for using our service.
        Regards,
        Cars on Demand!`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error generating OTP:', err);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
}

exports.getDashboardData = async (req, res) => {
  try {
    const owner = req.body.userId;
    console.log('Fetching dashboard data for owner:', owner);
    //Write a query to retrieve the rentals of a owner by car id
    const carIds = await Car.find({ owner });
    console.log('Car Ids:', carIds);
    const rentals = await Rental.find({ car: { $in: carIds } }).populate('car');
    const balance = await CarOwner.findOne({ _id: owner }).select('balance');
    console.log('Balance:', balance.balance);
    res.status(200).json({ rentals, balance: balance.balance });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};