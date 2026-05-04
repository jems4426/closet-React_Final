import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ChevronDown, ChevronUp, ShoppingBag, Truck, CheckCircle, XCircle, Clock, MapPin, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS = {
  paid:      { label: 'Confirmed',  icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200'  },
  shipped:   { label: 'Shipped',    icon: Truck,        color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  delivered: { label: 'Delivered',  icon: CheckCircle,  color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200'},
  cancelled: { label: 'Cancelled',  icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200'    },
  failed:    { label: 'Failed',     icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200'    },
  default:   { label: 'Processing', icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
};

const getStatus = (s) => STATUS[s] || STATUS.default;

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderModal = ({ order, onClose }) => {
  const st = getStatus(order.status);
  const Icon = st.icon;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Order Details</p>
            <h2 className="text-xl font-black text-gray-900">
              #{(order._id || order.id || '').toString().slice(-8).toUpperCase()}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Date */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${st.bg} ${st.color} ${st.border}`}>
              <Icon className="h-3.5 w-3.5" />
              {st.label}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-rose-500" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Address</p>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-bold text-gray-900">{order.address.fullName}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}, {order.address.state} — {order.address.postalCode}</p>
                <p>{order.address.country || 'India'}</p>
                <p className="text-rose-600 font-medium mt-1">Phone: {order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
            <div className="space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {item.name || item.product?.title || 'Product'}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="font-black text-gray-900">Total Paid</span>
            <span className="text-xl font-black text-rose-600">
              ₹{parseFloat(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, onView }) => {
  const [expanded, setExpanded] = useState(false);
  const st    = getStatus(order.status);
  const Icon  = st.icon;
  const date  = new Date(order.createdAt || order.date);
  const id    = (order._id || order.id || '').toString().slice(-8).toUpperCase();
  const total = parseFloat(order.totalAmount || order.total || 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-50">

      {/* Card Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">Order #{id}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${st.bg} ${st.color} ${st.border}`}>
            <Icon className="h-3.5 w-3.5" />
            {st.label}
          </span>
          <span className="font-black text-gray-900 text-lg">
            ₹{total.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => onView(order)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100">
            View Details
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-400">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Items Preview */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 py-4 space-y-3 bg-gray-50/50">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                <span className="text-gray-700 font-medium">
                  {item.name || item.product?.title || 'Product'}
                </span>
                <span className="text-gray-400">× {item.quantity}</span>
              </div>
              <span className="font-semibold text-gray-700">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          {order.address && (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="h-3.5 w-3.5 text-rose-400" />
              <span>{order.address.city}, {order.address.state}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Orders Page ─────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter]           = useState('all');

  const { user } = useAuth();
  const token    = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (token) {
          const res = await axios.get(`${API_URL}/orders`, { headers: authHeaders });
          if (Array.isArray(res.data)) {
            setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          } else {
            toast.error('Could not load orders from server.');
            setOrders(JSON.parse(localStorage.getItem('orders') || '[]'));
          }
        } else {
          setOrders(JSON.parse(localStorage.getItem('orders') || '[]'));
        }
      } catch {
        toast.error('Failed to load orders.');
        setOrders(JSON.parse(localStorage.getItem('orders') || '[]'));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const FILTERS = [
    { key: 'all',       label: 'All Orders' },
    { key: 'paid',      label: 'Confirmed'  },
    { key: 'shipped',   label: 'Shipped'    },
    { key: 'delivered', label: 'Delivered'  },
    { key: 'cancelled', label: 'Cancelled'  },
  ];

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
          <p className="text-gray-400 mt-1 text-sm">Track all your past and current orders here.</p>
        </div>

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                    : 'bg-white text-gray-500 hover:text-gray-800 border border-gray-100 hover:border-gray-200'
                }`}>
                {f.label}
                {f.key !== 'all' && (
                  <span className={`ml-1.5 text-xs ${filter === f.key ? 'opacity-70' : 'text-gray-400'}`}>
                    ({orders.filter(o => o.status === f.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-gray-400 mb-8">
              {filter === 'all' ? 'Start shopping and your orders will appear here.' : 'Try a different filter.'}
            </p>
            {filter === 'all' && (
              <Link to="/"
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200">
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard
                key={order._id || order.id}
                order={order}
                onView={setSelectedOrder}
              />
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default Orders;
