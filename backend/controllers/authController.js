const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const CarOwner = require('../models/CarOwner');
const jwt = require('jsonwebtoken');
const {sendWelcomeEmail} = require('../utils/mailer');
const Admin = require('../models/Admin');

// Signup handler
exports.signup = async (req, res) => {
  const { firstName, lastName, password, email, mobileNumber, drivingLicense, address, city, state, zipCode, alternateContactNumber} = req.body;

    const createdAt = new Date();
    const updatedAt = new Date();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = new Customer({ firstName, lastName, password: hashedPassword, email, mobileNumber, drivingLicense, address, city, state, zipCode, alternateContactNumber, createdAt, updatedAt });
    await customer.save();
    const token = jwt.sign(
        { id: customer._id, username: customer.firstName, role: 'Customer', email: customer.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
    sendWelcomeEmail(customer.email, customer.firstName);
      console.log('JWT generated for Customer:', token);
    res.status(201).json({ message: 'User created successfully', token });
  } catch (err) {
    console.log('Error creating user:', err.message);
    res.status(400).json({ error: 'Error creating user: ' + err.message });
  }
};

//CarOwner Signup handler
exports.carOwnerSignup = async (req, res) => {
  const { firstName, lastName, password, email, mobileNumber, stateID, address, city, state, zipCode, alternateContactNumber} = req.body;

    const createdAt = new Date();
    const updatedAt = new Date();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const carOwner = new CarOwner({ firstName, lastName, password: hashedPassword, email, mobileNumber, stateID, address, city, state, zipCode, alternateContactNumber, createdAt, updatedAt });
    await carOwner.save();
    const token = jwt.sign(
        { id: carOwner._id, username: carOwner.firstName, role: 'CarOwner', email: carOwner.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
      sendWelcomeEmail(carOwner.email, carOwner.username);
    res.status(201).json({ message: 'User created successfully', token });
  } catch (err) {
    res.status(400).json({ error: 'Error creating user: ' + err.message });
  }
};

exports.adminSignup = async (req, res) => {
  const {firstName, lastName, password, email} = req.body;
  const createdAt = new Date();
  const updatedAt = new Date();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ firstName, lastName, password: hashedPassword, email, createdAt, updatedAt });
    await admin.save();
    const token = jwt.sign(
        { id: admin._id, username: admin.firstName, role: 'Admin', email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
    res.status(201).json({ message: 'Admin created successfully', token });
  } catch (err) {
    res.status(400).json({ error: 'Error creating admin: ' + err.message });
  }
};

// Login handler
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login request received for email:', email);
    
    // Find user in the Customer collection first
    let user = await Customer.findOne({ email });
    let role = 'Customer';

    // If not found, check in CarOwner collection
    if (!user) {
      console.log('Customer not found, checking for CarOwner...');
      user = await CarOwner.findOne({ email });
      role = 'CarOwner';
    }

    // If still not found, check in Admin collection
    if (!user) {
      console.log('CarOwner not found, checking for Admin...');
      user = await Admin.findOne({ email });
      role = 'Admin';
    }

    // If the user was not found in any collection, return an error
    if (!user) {
      console.log('User not found in any collection, sending error response');
      return res.status(400).json({ error: 'User not found' });
    }

    console.log(`${role} found:`, user);

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for ${role}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token with user details and role
    const token = jwt.sign(
      { id: user._id, username: user.firstName, role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    console.log(`JWT generated for ${role}:`, token);
    return res.status(200).json({ token });

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};


