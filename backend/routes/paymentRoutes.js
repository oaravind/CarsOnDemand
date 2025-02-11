const express = require('express');

const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Define routes
router.post('/checkout', paymentController.checkout);
router.post('/success-flow', paymentController.successFlow);

module.exports = router;