const mongoose = require('mongoose');

const CarOwnerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  mobileNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  stateID: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  alternateContactNumber: { type: String },
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CarOwner', CarOwnerSchema, 'carOwners');