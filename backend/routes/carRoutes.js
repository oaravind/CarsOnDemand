const express = require('express');

const router = express.Router();
const carController = require('../controllers/carController');

// Define routes
router.post('/car/add', carController.addCar);
router.post('/car/all', carController.getAllCars);
router.post('/car/search', carController.searchCars);
router.get('/car/:id', carController.getCarById);
router.post('/car/changeAvailability/:id', carController.changeAvailability);
router.post('/car/delete/', carController.deleteCar);
module.exports = router;