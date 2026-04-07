import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/address-selection');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link
            to="/"
            className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.size}`} className={`flex items-center py-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1 ml-6">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">Size: {item.size}</p>
                    <p className="text-rose-600 font-semibold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center mx-6">
                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100"><Minus className="h-4 w-4" /></button>
                    <span className="mx-3 min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100"><Plus className="h-4 w-4" /></button>
                  </div>
                  <div className="text-right mr-6">
                    <p className="text-lg font-semibold text-gray-900">₹{(item.price * item.quantity)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.size)} className="text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <Link to="/" className="text-rose-600 hover:text-rose-700 font-medium">← Continue Shopping</Link>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">₹{getCartTotal()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-semibold">Free</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax (18%)</span><span className="font-semibold">₹{(getCartTotal() * 0.18).toFixed(0)}</span></div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold text-rose-600">₹{(getCartTotal() * 1.18).toFixed(0)}</span>
                </div>
              </div>
            </div>
            <button onClick={handleCheckout} className="w-full bg-rose-600 text-white py-3 rounded-lg font-semibold mt-6 hover:bg-rose-700 transition-colors">Proceed to Checkout</button>
            <button onClick={clearCart} className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold mt-3 hover:bg-gray-50">Clear Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
