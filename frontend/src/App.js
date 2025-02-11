import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './components/Index';
import Signup from './components/Signup';
import Login from './components/Login';
import SignUpPage from './components/CarOwnerSignup';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AddCar from './components/AddCar';
import Search from './components/Search';
import CarInfo from './components/CarInfo';
import Success from './components/Success';
import Bookings from './components/Bookings';
import Rentals from './components/Rentals';
import Rental from './components/Rental';
import AdminSignup from './components/AdminSignup';
import AdminDashboard from './components/AdminDashboard';
import AccessWrapper from './components/AccessWrapper';
import Settlement from './components/Settlement';
import Dispute from './components/Dispute';
import Booking from './components/Booking';
import CarsList from './components/CarsList';
import CarDetails from './components/CarDetails';
import CarOwnersPage from './components/ViewCarOwner';
import EditCarOwner from './components/EditCarOwner';
import CustomersPage from './components/ViewCustomers';
import EditCustomer from './components/EditCustomer';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/adminSignup" element={<AdminSignup />} />

        <Route path="/success" element={<Success />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/carOwnerSignup" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['CarOwner']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dispute/:settlementToken"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <Dispute />
            </PrivateRoute>
          }
        />
        <Route
          path='/admin'
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path='/carowners'
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <CarOwnersPage />
            </PrivateRoute>
          }
        />
        <Route
          path='/customers'
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <CustomersPage />
            </PrivateRoute>
          }
        />
        <Route
          path='/editcarowner/:id'
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <EditCarOwner />
            </PrivateRoute>
          }
        />

        <Route
          path='/editcustomer/:id'
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <EditCustomer />
            </PrivateRoute>
          }
        />

        <Route
          path="/addcar"
          element={
            <PrivateRoute allowedRoles={['CarOwner']}>
              <AddCar />
            </PrivateRoute>
          }
        />

        <Route
          path="/cars"
          element={
            <PrivateRoute allowedRoles={['CarOwner']}>
              <CarsList />
            </PrivateRoute>
          }
        />

        <Route path="/search"
          element={
            <PrivateRoute allowedRoles={['Customer']}>
              <Search />
            </PrivateRoute>
          }
        />
        <Route path="/booking/:id"
          element={
            <PrivateRoute allowedRoles={['Customer']}>
              <Booking />
            </PrivateRoute>
          }
        />
        <Route path="/bookings"
          element={
            <PrivateRoute allowedRoles={['Customer']}>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route path="/car/:id" element={<CarInfo />} />
        <Route path="/rentals" element={
          <PrivateRoute allowedRoles={['CarOwner']}>
            <Rentals />
          </PrivateRoute>
        } />
        <Route path="/rental/:id" element={
          <PrivateRoute allowedRoles={['CarOwner']}>
            <Rental />
          </PrivateRoute>
        } />
        <Route path="/cars/:id" element={
          <PrivateRoute allowedRoles={['CarOwner']}>
            <CarDetails />
          </PrivateRoute>
        } />
        <Route
          path="/settlement/:settlementToken"
          element={
            <AccessWrapper>
              <Settlement />
            </AccessWrapper>
          }
        />

      </Routes>

    </Router>
  );
}

export default App;
