require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const authRoutes = require('./routes/authRoutes');  // Importing auth routes
const carRoutes = require('./routes/carRoutes');  // Importing car routes
const carOwnerRoutes = require('./routes/carOwnerRoutes');  // Importing car owner routes
const paymentRoutes = require('./routes/paymentRoutes');  // Importing payment routes
const userRoutes = require('./routes/userRoutes');  // Importing user routes
const imageRoutes = require('./routes/imageRoutes');  // Importing image routes
const adminRoutes = require('./routes/adminRoutes');  // Importing admin routes
// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Failed to connect to MongoDB:', error));

// Routes
app.use('/api', authRoutes);  // Mounting auth routes under '/api'
app.use('/api', carRoutes);  // Mounting car routes under '/api'
app.use('/api/carOwner', carOwnerRoutes);  // Mounting car owner routes under '/api/carOwner'
app.use('/api/payment', paymentRoutes);  // Mounting payment routes under '/api/payment'
app.use('/api/user', userRoutes);  // Mounting user routes under '/api/user'
app.use('/api/images', imageRoutes); // Mounting image routes under '/api/images'
app.use('/api/admin', adminRoutes); // Mounting admin routes under '/api/admin'
// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Start server
app.listen(process.env.PORT || 5050, () => {
    console.log(`Server running on port ${process.env.PORT || 5050}`);
});
