const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

// Define routes
router.post('/rentals', userController.getAllRentals);
router.post('/cancelBooking', userController.cancelBooking);

module.exports = router;