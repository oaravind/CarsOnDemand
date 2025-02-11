const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/carOwnerSignup', authController.carOwnerSignup);
router.post('/adminSignup', authController.adminSignup);
module.exports = router;
