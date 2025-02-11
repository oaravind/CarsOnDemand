const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'CarOwner', required: true },
  maker: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  noOfMiles: { type: Number, required: true },
  fuelType: { type: String, required: true },
  gasLevel: { type: String, required: true },
  location: { type: String, required: true },
  // availableStartDate: { type: Date, required: true },
  // availableEndDate: { type: Date, required: true },
// List of available date-time ranges for renting
availableRanges: [
  {
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
  },
],

// Records of all bookings
bookings: [
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
  },
],

  // Pricing Information
  pricePerDay: { type: Number, required: true },
  pricePerHour: { type: Number, required: true },
  insurancePerDay: { type: Number, required: true },
 

  ratings: [{ type: Number }],
  images: [String],
  description: { type: String },
  features: [String],
  
  // Maintenance records for the car
  maintenanceRecords: [
    {
      date: { type: Date, default: Date.now },
      details: { type: String },
    },
  ],

  minimumHours: { type: Number, default: 4 }, // Minimum booking duration in hours
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the 'updatedAt' field before saving the document
CarSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Car', CarSchema);
