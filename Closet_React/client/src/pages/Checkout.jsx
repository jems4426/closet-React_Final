import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:4000/api';

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardType: ''
  });

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.match(/^4/)) return 'visa';
    if (cleaned.match(/^5[1-5]/)) return 'mastercard';
    if (cleaned.match(/^3[47]/)) return 'amex';
    return '';
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      let month = cleaned.substring(0, 2);
      if (parseInt(month) > 12) month = '12';
      if (parseInt(month) < 1 && month.length === 2) month = '01';
      return month + (cleaned.length > 2 ? '/' + cleaned.substring(2, 4) : '');
    }
    return cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      const formatted = formatCardNumber(value);
      const cardType = detectCardType(value);
      setCardDetails({...cardDetails, cardNumber: formatted, cardType});
    }
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value;
    if (value.length <= 5) {
      setCardDetails({...cardDetails, expiryDate: formatExpiry(value)});
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardDetails({...cardDetails, cvv: value});
    }
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      setSelectedAddress(JSON.parse(savedAddress));
    }
  }, []);

  const totalAmount = parseFloat((getCartTotal() * 1.18).toFixed(2));
  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    
    const processOrder = async () => {
      try {
        if (!selectedAddress) {
          setError('Please select a delivery address.');
          setProcessing(false);
          return;
        }
        
        if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
          setError('Please enter complete card details.');
          setProcessing(false);
          return;
        }
        
        setError(null);

        const orderData = {
          items: cartItems.map(item => ({
            product: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: totalAmount,
          currency: 'inr',
          status: 'paid',
          address: {
            fullName: selectedAddress.fullName,
            line1: selectedAddress.addressLine1,
            line2: selectedAddress.addressLine2 || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.pinCode,
            country: 'India',
            phone: selectedAddress.phone || user?.phone || ''
          }
        };

        if (token && user) {
          await axios.post(`${API_URL}/orders`, orderData, { headers: authHeaders });
        } else {
          const order = {
            ...orderData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            _id: Date.now().toString()
          };
          const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
          localStorage.setItem('orders', JSON.stringify([...existingOrders, order]));
        }

        for (const item of cartItems) {
          try {
            const stockData = { quantity: item.quantity };
            if (item.size && item.size !== 'Free Size' && item.size !== 'One Size') {
              stockData.size = item.size;
            }
            await axios.put(`${API_URL}/products/${item.id}/reduce-stock`, stockData, { headers: authHeaders });
          } catch (error) {
            // Stock reduction failed silently
          }
        }

        clearCart();
        localStorage.removeItem('selectedAddress');
        setProcessing(false);
        toast.success('Order placed successfully!');
        navigate('/orders');
      } catch (error) {
        // Order creation failed
        setError('Failed to create order. Please try again.');
        setProcessing(false);
      }
    };

    setTimeout(processOrder, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardDetails.cardNumber}
            onChange={handleCardNumberChange}
            className="w-full px-3 py-2 pl-16 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
            placeholder="4242 4242 4242 4242"
            required
          />
          <div className="absolute left-3 top-2 flex items-center">
            {cardDetails.cardType === 'visa' && <span className="text-blue-600 font-bold text-xs bg-white px-1 rounded">VISA</span>}
            {cardDetails.cardType === 'mastercard' && <span className="text-red-600 font-bold text-xs bg-white px-1 rounded">MC</span>}
            {cardDetails.cardType === 'amex' && <span className="text-blue-800 font-bold text-xs bg-white px-1 rounded">AMEX</span>}
            {!cardDetails.cardType && <span className="text-gray-400 font-bold text-xs bg-white px-1 rounded">CARD</span>}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cardDetails.expiryDate}
            onChange={handleExpiryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
            placeholder="MM/YY"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cardDetails.cvv}
            onChange={handleCvvChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
            placeholder="123"
            required
          />
        </div>
      </div>
      
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-rose-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
};


const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const totalAmount = parseFloat((getCartTotal() * 1.18).toFixed(2));

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Size: {item.size} × {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between"><p>Subtotal</p><p>₹{getCartTotal().toFixed(2)}</p></div>
              <div className="flex justify-between"><p>GST (18%)</p><p>₹{(getCartTotal() * 0.18).toFixed(2)}</p></div>
              <div className="flex justify-between font-bold text-lg"><p>Total</p><p>₹{totalAmount.toFixed(2)}</p></div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6">
            <CheckoutForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
