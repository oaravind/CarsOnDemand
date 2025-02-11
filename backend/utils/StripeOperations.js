// stripeOperations.js
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Replace with your actual Secret Key

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
    // Step 1: Retrieve the customer's default payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card', // Assuming that you are charging via card
    });

    if (paymentMethods.data.length === 0) {
      throw new Error('No payment methods are available for this customer');
    }

    const paymentMethodId = paymentMethods.data[0].id; // Use the first available card

    // Step 2: Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency:'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true, // Confirm the payment intent right away
      off_session: true, // Important if charging without active user session
    });

    console.log('PaymentIntent successfully created and confirmed:', paymentIntent.id);
    return paymentIntent;
  } catch (error) {
    console.error('Error charging customer:', error);
    throw error;
  }
}
module.exports = {
  getSessionDetails,
  refundPayment,
  getCustomerId,
  chargeCustomer,
};
