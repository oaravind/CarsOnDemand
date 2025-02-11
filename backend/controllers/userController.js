const { Query } = require('mongoose');
const Car = require('../models/Car');
const CarOwner = require('../models/CarOwner');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const {refundPayment} = require('../utils/StripeOperations');  // Importing the refundPayment function from paymentService.js
const sendEmail = require('../utils/mailer');


//Getting all rentals of a Customer
exports.getAllRentals = async (req, res) => {
    try {
      const customer = req.body.customer;
      console.log('Customer:', customer);
      if (!customer) {
        return res.status(400).json({ error: 'Customer ID is required.' });
      }
  
      // Use `find` method to get all rentals for the customer
      const rentals = await Rental.find({ customer }).populate('car').exec(); // `.populate('car')` to include car details
      
      if (!rentals.length) {
        return res.status(404).json({ message: 'No rentals found for the customer.' });
      }
  
      console.log('Here are the rentals of the user: \n', rentals);
      res.status(200).json(rentals);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      res.status(400).json({ error: 'Error fetching rentals: ' + err.message });
    }
  };

exports.cancelBooking = async (req, res) => {
    const { id } = req.body;
    try {
      const rental = await Rental.findById(id);
      if (!rental) {
        return res.status(404).json({ error: 'Rental not found' });
      }
  
      const payment = await Payment.findOne({ rental: id });
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
  
      rental.status = 'Canceled';
      const refundAmount = (rental.totalCost - rental.deposit).toFixed(2);
  
      const refund = await refundPayment(payment.paymentIntentId, parseInt(refundAmount*100));
      console.log('Refund:', refund);
      await rental.save();
      sendEmail(rental.customer.email, 'Rental Cancellation', `We regret to inform you that your rental has been canceled. The amount of $${rental.totalCost} has been refunded to your account. Please allow 3-5 business days for the refund to reflect in your account. \nThank you for using our service.\n\nRegards,\nCars on Demand!`);
      res.status(200).json({ message: 'Rental canceled successfully' });
    }
    catch (err) {
      res.status(400).json({ error: 'Error canceling rental: ' + err.message });
    }
  };

