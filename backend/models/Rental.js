const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  deposit: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  insurance: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  noOfMilesUsed: { type: Number, required: true, default: 0 },
  gasLevel: { type: String, required: true, default: 'N/A' },
  pickUpAddress: { type: String, required: true },
  dropOffAddress: { type: String, required: true },
  status: { type: String, default: 'Booked' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rental', RentalSchema);
