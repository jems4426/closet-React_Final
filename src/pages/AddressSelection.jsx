import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AddressManager from '../components/AddressManager';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AddressSelection = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/addresses`, { headers: authHeaders });
      setAddresses(res.data);
      // Auto-select default address if exists
      const defaultAddress = res.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fashion-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fashion-gradient py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/cart')} 
          className="flex items-center text-gray-600 hover:text-rose-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Select Delivery Address</h1>
              
              <AddressManager 
                onAddressSelect={setSelectedAddress}
                selectedAddressId={selectedAddress?._id}
              />

              {selectedAddress && (
                <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <h3 className="font-semibold text-rose-800 mb-2">Selected Address:</h3>
                  <p className="text-rose-700">
                    {selectedAddress.fullName}<br/>
                    {selectedAddress.addressLine1}
                    {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}<br/>
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pinCode}
                    {selectedAddress.phone && <><br/>Phone: {selectedAddress.phone}</>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between"><p>Subtotal</p><p>₹{getCartTotal()}</p></div>
                  <div className="flex justify-between"><p>GST (18%)</p><p>₹{(getCartTotal() * 0.18).toFixed(0)}</p></div>
                  <div className="flex justify-between font-bold text-lg"><p>Total</p><p>₹{(getCartTotal() * 1.18).toFixed(0)}</p></div>
                </div>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={!selectedAddress}
                className="w-full mt-6 px-8 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelection;