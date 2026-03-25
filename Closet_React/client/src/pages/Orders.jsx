import React, { useState, useEffect } from 'react';
import { Package, Calendar, CreditCard, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:4000/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (token) {
          const res = await axios.get(`${API_URL}/orders`, { headers: authHeaders });
          setOrders(res.data);
        } else {
          const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
          setOrders(savedOrders);
        }
      } catch (error) {
        toast.error('Failed to load orders');
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(savedOrders);
      }
    };
    fetchOrders();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const OrderModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Order Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">Order ID</p><p className="font-semibold">{order._id || order.id}</p></div>
              <div><p className="text-sm text-gray-600">Date</p><p className="font-semibold">{new Date(order.createdAt || order.date).toLocaleDateString()}</p></div>
              <div><p className="text-sm text-gray-600">Status</p><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</span></div>
              <div><p className="text-sm text-gray-600">Total</p><p className="font-semibold text-lg">₹{order.totalAmount || order.total}</p></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name || item.product?.title || 'Product'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                    </div>
                    <p className="font-semibold">₹{(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
          <p className="text-gray-600">Start shopping to see your orders here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <Package className="h-8 w-8 text-rose-600" />
                    <div>
                      <h3 className="text-lg font-semibold">Order #{(order._id || order.id).slice(-8)}</h3>
                      <div className="flex items-center text-sm text-gray-600"><Calendar className="h-4 w-4 mr-1" />{new Date(order.createdAt || order.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                    <div className="flex items-center text-lg font-semibold"><CreditCard className="h-5 w-5 mr-1" />₹{order.totalAmount || order.total}</div>
                    <button onClick={() => setSelectedOrder(order)} className="flex items-center text-rose-600 hover:text-rose-700 font-medium"><Eye className="h-4 w-4 mr-1" />View</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

export default Orders;
