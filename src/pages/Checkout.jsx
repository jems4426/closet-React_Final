import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, CreditCard, Smartphone, Truck,
  ShieldCheck, Lock, CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPI_ID   = 'jramani181@upi';
const UPI_NAME = 'Closet';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod]     = useState('card');
  const [processing, setProcessing]           = useState(false);
  const [paymentSuccess, setPaymentSuccess]   = useState(false);
  const [error, setError]                     = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Card States
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv]               = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [upiId, setUpiId]           = useState('');

  const subtotal    = getCartTotal();
  const gst         = parseFloat((subtotal * 0.18).toFixed(2));
  const totalAmount = parseFloat((subtotal + gst).toFixed(2));
  const token       = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const saved = localStorage.getItem('selectedAddress');
    if (saved) setSelectedAddress(JSON.parse(saved));
  }, []);

  // ── Input Handlers ──────────────────────────────────────────────────────────
  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setExpiryDate(val);
  };

  const handleCvv = (e) => {
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setProcessing(true);

    try {
      const orderData = {
        items: cartItems.map(i => ({ product: i.id, quantity: i.quantity, price: i.price })),
        totalAmount,
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
        const order = { ...orderData, id: Date.now(), createdAt: new Date().toISOString(), _id: String(Date.now()) };
        const prev = JSON.parse(localStorage.getItem('orders') || '[]');
        localStorage.setItem('orders', JSON.stringify([...prev, order]));
      }

      // Reduce stock
      for (const item of cartItems) {
        try {
          const sd = { quantity: item.quantity };
          if (item.size && item.size !== 'Free Size' && item.size !== 'One Size') sd.size = item.size;
          await axios.put(`${API_URL}/products/${item.id}/reduce-stock`, sd, { headers: authHeaders });
        } catch {}
      }

      clearCart();
      localStorage.removeItem('selectedAddress');
      setProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => navigate('/orders'), 2500);
    } catch (err) {
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-8">Your order of ₹{totalAmount.toFixed(2)} has been placed successfully.</p>
        <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 animate-pulse" style={{ width: '100%' }}></div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        <Link to="/address-selection" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Checkout
        </Link>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Side: Address & Payment */}
          <div className="flex-1 space-y-6">
            
            {/* Address Card */}
            {selectedAddress ? (
              <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Delivering to</p>
                  <h3 className="text-xl font-black mb-1">{selectedAddress.fullName}</h3>
                  <p className="text-sm text-gray-300 opacity-90">
                    {selectedAddress.addressLine1}, {selectedAddress.city} - {selectedAddress.pinCode}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => navigate('/address-selection')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <MapPin className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => navigate('/address-selection')}
                className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-8 text-gray-400 hover:border-rose-400 hover:text-rose-500 transition-all flex flex-col items-center gap-2"
              >
                <MapPin className="h-8 w-8" />
                <span className="font-bold">Select Delivery Address</span>
              </button>
            )}

            {/* Payment Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Select Payment Method</h2>
              <div className="flex items-center gap-2 text-green-600 text-xs font-bold mb-8">
                <Lock className="h-3.5 w-3.5" />
                <span>SECURE & ENCRYPTED TRANSACTIONS</span>
              </div>

              <div className="space-y-4">
                
                {/* Credit Card Option */}
                <div 
                  onClick={() => setPaymentMethod('card')}
                  className={`cursor-pointer border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'card' ? 'border-rose-500 bg-rose-50/30' : 'border-gray-100 bg-white'}`}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-rose-500' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-rose-500" />}
                      </div>
                      <span className="font-bold text-gray-800">Credit / Debit Card</span>
                    </div>
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="px-5 pb-6 space-y-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Card Number</label>
                        <input 
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumber}
                          placeholder="0000 0000 0000 0000"
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                          <input 
                            type="text"
                            value={expiryDate}
                            onChange={handleExpiry}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CVV</label>
                          <input 
                            type="password"
                            value={cvv}
                            onChange={handleCvv}
                            placeholder="•••"
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Name on Card</label>
                        <input 
                          type="text"
                          value={nameOnCard}
                          onChange={(e) => setNameOnCard(e.target.value)}
                          placeholder="Enter full name"
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* UPI Option */}
                <div 
                  onClick={() => setPaymentMethod('upi')}
                  className={`cursor-pointer border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'upi' ? 'border-rose-500 bg-rose-50/30' : 'border-gray-100 bg-white'}`}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-rose-500' : 'border-gray-300'}`}>
                        {paymentMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-rose-500" />}
                      </div>
                      <span className="font-bold text-gray-800">UPI Mobile Payments</span>
                    </div>
                    <Smartphone className="h-6 w-6 text-gray-400" />
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="px-5 pb-6 text-center animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-block p-4 bg-white border border-gray-100 rounded-3xl shadow-inner mb-4">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmount}&cu=INR`)}`} 
                          alt="UPI QR"
                          className="w-40 h-40"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mb-4">Scan QR code with any UPI app to pay</p>
                      <input 
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="Enter your UPI ID (e.g. name@bank)"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* COD Option */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`cursor-pointer border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'cod' ? 'border-rose-500 bg-rose-50/30' : 'border-gray-100 bg-white'}`}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-rose-500' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-rose-500" />}
                      </div>
                      <span className="font-bold text-gray-800">Cash on Delivery</span>
                    </div>
                    <Truck className="h-6 w-6 text-gray-400" />
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="px-5 pb-6 animate-fadeIn">
                      <p className="text-sm text-gray-500">Pay with cash when your order is delivered.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Right Side: Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-black text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-5 mb-8">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image ? `http://localhost:4000${item.image}` : 'https://placehold.co/100x100?text=Closet'} 
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-t border-gray-50">
                <div className="flex justify-between text-gray-500 font-bold text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold text-sm">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6 border-t border-gray-100">
                <span className="text-lg font-black text-gray-900">Total</span>
                <span className="text-2xl font-black text-rose-600">₹{totalAmount.toFixed(2)}</span>
              </div>

              <button 
                type="submit"
                disabled={processing}
                className={`w-full py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-rose-100 ${processing ? 'bg-gray-200 text-gray-400' : 'bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-1'}`}
              >
                {processing ? 'Processing...' : `Secure Pay ₹${totalAmount.toFixed(2)}`}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-black tracking-widest uppercase">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>SSL Encrypted Payment</span>
              </div>
            </div>
          </div>

        </form>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Checkout;
