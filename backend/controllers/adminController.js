const { Query } = require('mongoose');
const Car = require('../models/Car');
const Admin = require('../models/Admin');
const CarOwner = require('../models/CarOwner');
const Customer = require('../models/Customer');


exports.adminDashboard = async (req, res) => {
    try {
        console.log('Admin dashboard request received:', req.body);
        const adminId = req.body.adminId;
        const admin = await Admin.findById(adminId);    
        console.log('Admin:', admin);
        if (!admin) {
            console.log('Admin not found');
            return res.status(404).json({ error: 'Admin not found' });
        }
        const commissionAmount = admin.commissionBalance;
        //write a query to get the count of car owners, customers, and cars
        const carOwnersCount = await Car.distinct('owner');
        console.log('Here the car owners count: \n', carOwnersCount.length);

        const customersCount = await Customer.countDocuments();
        console.log('Here the customers count: \n', customersCount);

        const carsCount = await Car.countDocuments();
        console.log('Here the cars count: \n', carsCount);

        //Get Carowners id who are isVerified false
        const carOwners = await CarOwner.find({ isVerified: false }).select('_id firstName lastName stateID');
        console.log('Here the car owners who are not verified: \n', carOwners);

        res.status(200).json({ commissionAmount, carOwnersCount: carOwnersCount.length, customersCount, carsCount, carOwners});
    } catch (err) {
        res.status(400).json({ error: 'Error fetching dashboard data: ' + err.message });
    }
};

exports.verifyCarOwner = async (req, res) => {
    try {
        const id = req.body.id;
        const carOwner = await CarOwner.findById(id);
        if (!carOwner) {
            return res.status(404).json({ error: 'Car Owner not found' });
        }
        carOwner.isVerified = true;
        await carOwner.save();
        res.status(200).json({ message: 'Car Owner verified successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Error verifying car owner: ' + err.message });
    }
};

exports.deleteCarOwner = async (req, res) => {
    try {
        const id = req.body.id;
        const carOwner = await CarOwner.findByIdAndDelete(id);
        if (!carOwner) {
            return res.status(404).json({ error: 'Car Owner not found' });
        }
        res.status(200).json({ message: 'Car Owner deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Error deleting car owner: ' + err.message });
    }
}

exports.getCarOwners = async (req, res) => {
    try {
      const carOwners = await CarOwner.find();
      res.status(200).json(carOwners);
    } catch (err) {
      res.status(400).json({ error: 'Error fetching car owners: ' + err.message });
    }
  }

exports.getCarOwnerById = async (req, res) => {
    try {
        const carOwner = await CarOwner.findById(req.params.id);
        if (!carOwner) {
            return res.status(404).json({ error: 'Car Owner not found' });
        }
        res.status(200).json(carOwner);
    } catch (err) {
        res.status(400).json({ error: 'Error fetching car owner: ' + err.message });
    }
}

exports.updateCarOwner = async (req, res) => {
    try {
        const carOwner = await CarOwner.findById(req.params.id);
        if (!carOwner) {
            return res.status(404).json({ error: 'Car Owner not found' });
        }
        carOwner.firstName = req.body.firstName;
        carOwner.lastName = req.body.lastName;
        carOwner.email = req.body.email;
        carOwner.mobileNumber = req.body.mobileNumber;
        carOwner.alternateMobileNumber = req.body.alternateMobileNumber;
        carOwner.address = req.body.address;
        carOwner.city = req.body.city;
        carOwner.state = req.body.state;
        carOwner.zipCode = req.body.zipCode;
        carOwner.stateID = req.body.stateID;
        carOwner.status = req.body.status;
        await carOwner.save();
        res.status(200).json({ message: 'Car Owner updated successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Error updating car owner: ' + err.message });
    }
}

//Get carOwner with mobileNumber
exports.getCarOwnerByMobileNumber = async (req, res) => {
    try {
        console.log('Here the mobileNumber: ', req.body.mobileNumber);
        const carOwner = await CarOwner.findOne({ mobileNumber: req.body.mobileNumber });
        if (!carOwner) {
            return res.status(404).json({ error: 'Car Owner not found' });
        }
        res.status(200).json(carOwner);
    } catch (err) {
        res.status(400).json({ error: 'Error fetching car owner: ' + err.message });
    }
};

//delete carOwner with id
exports.deleteCarOwner = async (req, res) => {
    try {
        const carOwner = await CarOwner.findById(req.params.id);
        if (!carOwner) {
            return res.status(404).json({ error: 'Car Owner not found' });
        }
        await carOwner.remove();
        await Car.deleteMany({ owner: req.params.id });
        res.status(200).json({ message: 'Car Owner deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Error deleting car owner: ' + err.message });
    }
};

//Get Customers
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (err) {
        res.status(400).json({ error: 'Error fetching customers: ' + err.message });
    }
}

//Get Customer by id
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (err) {
        res.status(400).json({ error: 'Error fetching customer: ' + err.message });
    }
}

//Update Customer
exports.updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        customer.firstName = req.body.firstName;
        customer.lastName = req.body.lastName;
        customer.email = req.body.email;
        customer.mobileNumber = req.body.mobileNumber;
        customer.alternateMobileNumber = req.body.alternateMobileNumber;
        customer.address = req.body.address;
        customer.city = req.body.city;
        customer.state = req.body.state;
        customer.zipCode = req.body.zipCode;
        customer.drivingLicense = req.body.drivingLicense;
        await customer.save();
        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Error updating customer: ' + err.message });
    }
}

//Get customer with mobileNumber
exports.getCustomerByMobileNumber = async (req, res) => {
    try {
        console.log('Here the mobileNumber:', req.body.mobileNumber);
        const customer = await Customer.findOne({ mobileNumber: req.body.mobileNumber });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (err) {
        res.status(400).json({ error: 'Error fetching customer: ' + err.message });
    }
};

//delete customer with id
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        await customer.remove();
        //delete all rentals of this customer
        await Rental.deleteMany({ customer: req.params.id });
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Error deleting customer: ' + err.message });
    }
};