const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  //customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customer: { type: String, required: true },
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true },
  status: { type: String, required: true },
  sessionId: { type: String, required: true },
  paymentIntentId: { type: String, required: true },
  refundId: { type: String},
  chargebackId: { type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema);