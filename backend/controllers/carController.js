const { Query } = require('mongoose');
const Car = require('../models/Car');
const CarOwner = require('../models/CarOwner');
const jwt = require('jsonwebtoken');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const {refundPayment} = require('../utils/StripeOperations');  // Importing the refundPayment function from paymentService.js

//Adding Car to the database
exports.addCar = async (req, res) => {
  const { owner, maker, model, year, licensePlate, noOfMiles,fuelType, gasLevel, location, availableStartDate, availableEndDate, pricePerDay, pricePerHour, insurancePerDay, images, description } = req.body;
  const features = req.body.features.split(',').map(feature => feature.trim());
  const maintenanceRecords = { details: req.body.maintenanceRecords };

  let endDate = new Date(`${availableEndDate} 23:59:59`);
  const availableRanges = { startDateTime: availableStartDate, endDateTime: endDate };

  try {
    const car = new Car({ owner, maker, model, year, licensePlate, noOfMiles, fuelType, gasLevel, location, availableRanges, pricePerDay, pricePerHour, insurancePerDay, images, description, features, maintenanceRecords });
    const carRes = await car.save();
    const carOwner = await CarOwner.findById(owner);
    if (!carOwner) {
      return res.status(404).json({ error: 'Car owner not found' });
    }
    carOwner.cars.push(carRes._id);
    await carOwner.save();
    res.status(201).json({ message: 'Car added successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Error adding car: ' + err.message });
  }
};

//Get all cars of a Car Owner
exports.getAllCars = async (req, res) => {
  try {
    const owner = req.body.owner;
    const cars = await Car.find({ owner });
    console.log('Here the cars of the user: \n', cars);
    res.status(200).json(cars);
  } catch (err) {
    res.status(400).json({ error: 'Error fetching cars: ' + err.message });
  }
};

//Search for cars
exports.searchCars = async (req, res) => {
  const { location, availableStartDate, availableEndDate, pickUpTime, dropOffTime } = req.body;
  console.log('Search request received:', req.body);
  const pickupDateTime = new Date(`${availableStartDate} ${pickUpTime}`)
  const dropoffDateTime = new Date(`${availableEndDate} ${dropOffTime}`)

  if (!location || !pickupDateTime || !dropoffDateTime) {
    return res.status(400).json({ error: 'Location, pickup date-time, and dropoff date-time are required.' });
  }

  try {
    // Parse the input dates to Date objects
    const pickup = pickupDateTime;
    const dropoff = dropoffDateTime;
    console.log('Pickup:', pickup);
    console.log('Dropoff:', dropoff);
    // MongoDB query to find available cars
    const availableCars = await Car.find({
      location: { $regex: new RegExp(location, 'i') }, // Match location case insensitively
      availableRanges: {
        $elemMatch: {
            startDateTime: { $lte: pickup },  // The available range must start before or at the pickup time
            endDateTime: { $gte: dropoff }    // The available range must end after or at the dropoff time
        }
    }
      // availableStartDate: { $lte: pickup },  // The available range must start before or at the pickup time
      // availableEndDate: { $gte: dropoff }    // The available range must end after or at the dropoff time
    });

    res.status(200).json(availableCars);
  } catch (err) {
    console.error('Error finding available cars:', err);
    res.status(500).json({ error: 'Failed to find available cars' });
  }
};

//Get car by id
exports.getCarById = async (req, res) => {
  try {
    //console.log('Here the id: ',req.params.id);
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    console.log('Here the car: \n', car);
    res.status(200).json(car);
  } catch (err) {
    res.status(400).json({ error: 'Error fetching car: ' + err.message });
  }
};

//Update car availability
exports.changeAvailability = async (req, res) => {
  const { newAvailableStartDate, newAvailableStartTime, newAvailableEndDate, newAvailableEndTime } = req.body;
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    car.availableStartDate = new Date(`${newAvailableStartDate} ${newAvailableStartTime}`);
    car.availableEndDate = new Date(`${newAvailableEndDate} ${newAvailableEndTime}`);
    await car.save();
    res.status(200).json({ message: 'Car availability updated successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Error updating car availability: ' + err.message });
  }
};


//Delete car
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    await car.remove();
    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Error deleting car: ' + err.message });
  }
};


