require('dotenv').config();
const { Query } = require('mongoose');
const Car = require('../models/Car');
const CarOwner = require('../models/CarOwner');
const Customer = require('../models/Customer');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
//const stripe = Stripe('sk_test_51QR2PTGPu........................'); // Secret key from Stripe
const YOUR_DOMAIN = 'http://localhost:3000';
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const { calculateNumberOfDays } = require('../../frontend/src/modules/CustomFunctions');

exports.checkout = async (req, res) => {
    
    const { amount, email } = req.body; // Get the dynamic amount from the request body
    console.log('Email:', email);
    try {
      // Create a Customer object in Stripe
    const customer = await stripe.customers.create({
      email: email,
      description: 'Customer created for car rental checkout',
    });
    console.log('Stripe Customer:', customer);
      // Create a Checkout session with the amount passed from the client
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Car Rental',
              },
              unit_amount: amount, // Amount must be in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer: customer.id, // Use the customer ID here
        //customer_email: email, // Add the customer's email here
        payment_intent_data: {
          setup_future_usage: 'off_session', // This allows future payments without asking the customer again
        },
      
        success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/canceled`,
      });
  
      res.status(200).json({ url: session.url }); // Send the checkout session URL to the client
    } catch (err) {
      console.error('Error creating checkout session:', err);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  };

  const mongoose = require('mongoose');
const { sendEmail } = require('../utils/mailer');


  exports.successFlow = async (req, res) => {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
          const { customer } = req.body;
          console.log('Customer details received after payment success: ', customer);
  
          const carId = customer?.carId;
          const pickUpTime = new Date(`${customer?.availableStartDate} ${customer?.pickUpTime}`);
          const dropOffTime = new Date(`${customer?.availableEndDate} ${customer?.dropOffTime}`);
          const sessionId = customer?.sessionId;
  
          if (!carId || isNaN(pickUpTime) || isNaN(dropOffTime) || !sessionId) {
              throw new Error('Invalid request data: Missing or incorrect dates or sessionId');
          }
  
          console.log('Success Flow: CarId:', carId, 'PickUpTime:', pickUpTime, 'DropOffTime:', dropOffTime);
  
          // Check if payment with the same sessionId already exists
          const existingPayment = await Payment.findOne({ sessionId }).session(session);
          if (existingPayment) {
              console.error('Duplicate session detected: Payment has already been processed with sessionId:', sessionId);
              return res.status(200).json({ message: 'Car availability was already updated successfully.' });
          }
  
          // Fetch car document
          const car = await Car.findById(carId).session(session);
          if (!car) {
              throw new Error('Car not found with ID: ' + carId);
          }
  
  
          // Create rental document
          let insurance = 0;
          if (customer.insurance) {
              insurance = car.insurancePerDay * calculateNumberOfDays(pickUpTime, dropOffTime);
          }
            let deposit = parseFloat((customer.amount - (customer.amount / 1.2)).toFixed(2));
          let commissionAmount = parseFloat(((customer.amount - deposit) * 0.06).toFixed(2));
  
          const rental = new Rental({
              car: carId,
              customer: customer.id,
              startDate: pickUpTime,
              endDate: dropOffTime,
              deposit: deposit,
              insurance: insurance,
              commissionAmount: commissionAmount,
              totalCost: customer.amount,
              pickUpAddress: customer.pickUpAddress,
              dropOffAddress: customer.pickUpAddress,
          });
  
          const rentalRes = await rental.save({ session });
  
          // Create payment document
          const obj = await getSessionDetails(sessionId);
          const paymentIntentId = obj.paymentIntentId;
          const customerId = obj.customerId;
          console.log('The stripe customer id is: ', obj.customerId);
          const payment = new Payment({
              sessionId: sessionId,
              paymentIntentId: paymentIntentId,
              rental: rentalRes._id,
              customer: customerId,
              status: 'succeeded',
          });
  
          await payment.save({ session });
  
          // Update car's availability dates
          let updatedRanges = [];
        let bookingFound = false;

        for (let range of car.availableRanges) {
            const rangeStartDate = new Date(range.startDateTime);
            const rangeEndDate = new Date(range.endDateTime);

            if (pickUpTime >= rangeStartDate && dropOffTime <= rangeEndDate) {
                bookingFound = true;

                const bufferTimeMs = 60 * 60 * 1000; // 1 hour buffer time

                if (pickUpTime > rangeStartDate) {
                    updatedRanges.push({
                        startDateTime: rangeStartDate,
                        endDateTime: new Date(pickUpTime.getTime() - bufferTimeMs),
                    });
                }

                if (dropOffTime < rangeEndDate) {
                    updatedRanges.push({
                        startDateTime: new Date(dropOffTime.getTime() + bufferTimeMs),
                        endDateTime: rangeEndDate,
                    });
                }
            } else {
                updatedRanges.push(range);
            }
        }

        if (!bookingFound) {
            throw new Error('Requested booking dates are not available for car: ' + carId);
        }

        // Update car availability atomically within the transaction
        const updatedCar = await Car.findByIdAndUpdate(
            carId,
            {
                $set: { availableRanges: updatedRanges },
                $push: {
                    bookings: {
                        startDateTime: pickUpTime,
                        endDateTime: dropOffTime,
                        customerId: customer.id,
                        totalPrice: customer.amount,
                    },
                },
            },
            { new: true, session } // Update with the session
        );

        if (!updatedCar) {
            throw new Error('Failed to update car availability for car: ' + carId);
        }


          //Add rental to customer
          const customerDoc = await Customer.findById(customer.id).session(session);
          customerDoc.rentals.push(rentalRes._id);

          sendEmail(customerDoc.email, 'Rental Confirmation', `Your rental has been confirmed for ${car.maker} ${car.model} from ${pickUpTime} to ${dropOffTime}.`);
          await customerDoc.save({ session });
  
          // Commit the transaction
          await session.commitTransaction();
          res.status(200).json({ message: 'Car successfully booked and availability updated' });
  
      } catch (err) {
          await session.abortTransaction();
          console.error('Error in booking flow:', err);
          res.status(500).json({ error: 'Failed to process booking' });
      } finally {
          session.endSession();
      }
  };
  

async function getSessionDetails(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paymentIntentId = session.payment_intent;
      const customerId = session.customer;
      let obj = { paymentIntentId, customerId };
      return obj;
    } catch (error) {
      console.error("Error retrieving session:", error);
      throw error;
    }
  }
  
  async function refundPayment(paymentIntentId, amount) {
    try {
      // Retrieve the payment intent to get the Charge ID
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const chargeId = paymentIntent.latest_charge;
  
      // Create a refund for the given Charge ID
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount, // Refund the specific amount (in cents)
      });
  
      console.log("Refund created:", refund);
      return refund;
    } catch (error) {
      console.error("Error creating refund:", error);
      throw error;
    }
  }
  
  async function getCustomerId(sessionId) {
    try {
      // Retrieve the Checkout Session from Stripe using the session ID
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const customerId = session.customer;
  
      // Return the customer ID
      return customerId;
    } catch (error) {
      console.error("Error retrieving customer ID from session:", error);
      throw error;
    }
  }
  
  async function chargeCustomer(customerId, amount) {
    try {
      // Create a new PaymentIntent for the existing customer
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        customer: customerId,
        payment_method_types: ['card'],
        confirm: true, // Automatically confirm the payment after creating it
        off_session: true, // Charge the card without requiring the customer to be present
      });
  
      console.log("PaymentIntent created:", paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error("Error charging customer:", error);
      throw error;
    }
  }
