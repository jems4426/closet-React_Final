import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductView from './pages/ProductView';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import About from './pages/About';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Checkout from './pages/Checkout';
import AddressSelection from './pages/AddressSelection';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/men" element={<Dashboard key="men" category="Men" />} />
              <Route path="/women" element={<Dashboard key="women" category="Women" />} />
              <Route path="/product/:id" element={<ProductView />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected Routes */}
              <Route 
                path="/cart" 
                element={<ProtectedRoute><Cart /></ProtectedRoute>} 
              />
              <Route 
                path="/orders" 
                element={<ProtectedRoute><Orders /></ProtectedRoute>} 
              />
              <Route 
                path="/wishlist" 
                element={<ProtectedRoute><Wishlist /></ProtectedRoute>} 
              />
              <Route 
                path="/profile" 
                element={<ProtectedRoute><Profile /></ProtectedRoute>} 
              />
              <Route 
                path="/change-password" 
                element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} 
              />
              <Route 
                path="/address-selection" 
                element={<ProtectedRoute><AddressSelection /></ProtectedRoute>} 
              />
              <Route 
                path="/checkout" 
                element={<ProtectedRoute><Checkout /></ProtectedRoute>} 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={<AdminRoute><AdminDashboard /></AdminRoute>} 
              />
            </Routes>
          </Layout>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
