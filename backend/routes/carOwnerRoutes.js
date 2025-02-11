const express = require('express');

const router = express.Router();
const carOwnerController = require('../controllers/carOwnerController');

// Define routes
router.get('/address/:id', carOwnerController.getCarOwnerAddress);
router.post('/rentals', carOwnerController.getCarOwnerRentals);
router.get('/rental/:id', carOwnerController.getRentalById);
router.post('/startRental', carOwnerController.startRental);
router.post('/generateOTP', carOwnerController.generateOTP);
router.post('/extendRental', carOwnerController.extendRental);
router.post('/cancelRental', carOwnerController.cancelRental);
router.post('/endRental', carOwnerController.endRental);
router.post('/approveSettlement', carOwnerController.approveSettlement);
router.post('/disputeSettlement', carOwnerController.disputeSettlement);
router.post('/dashboard', carOwnerController.getDashboardData);
router.post('/checkStatus', carOwnerController.checkStatus);
module.exports = router;