const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { route } = require('./carRoutes');

// Define routes
router.post('/dashboard', adminController.adminDashboard);
router.post('/verifyCarOwner', adminController.verifyCarOwner);
router.post('/rejectCarOwner', adminController.deleteCarOwner);
router.get('/carOwners', adminController.getCarOwners);
router.get('/carOwner/:id', adminController.getCarOwnerById);
router.put('/carOwner/edit/:id', adminController.updateCarOwner);
router.post('/carOwners/search', adminController.getCarOwnerByMobileNumber);
router.delete('/carOwner/:id', adminController.deleteCarOwner);
router.get('/customers', adminController.getCustomers);
router.get('/customer/:id', adminController.getCustomerById);
router.put('/customer/edit/:id', adminController.updateCustomer);
router.delete('/customer/:id', adminController.deleteCustomer);
router.post('/customers/search', adminController.getCustomerByMobileNumber);
module.exports = router;