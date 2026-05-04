import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Package, ShoppingCart, DollarSign, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [productFilters, setProductFilters] = useState({ q: '', mainCategory: '', subCategory: '', minPrice: '', maxPrice: '', inStock: '' });
  const [orderFilters, setOrderFilters] = useState({ q: '', status: '' });
  const [userFilters, setUserFilters] = useState({ q: '', role: '' });
  const [contactFilters, setContactFilters] = useState({ q: '', status: '' });

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchProducts = async () => {
    const params = {}; 
    Object.entries(productFilters).forEach(([k, v]) => { 
      if (v) {
        if (k === 'minPrice' || k === 'maxPrice') {
          params[k] = Number(v);
        } else {
          params[k] = v;
        }
      }
    });
    try {
        const res = await axios.get(`${API_URL}/products`, { params });
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          toast.error(res.data.message || 'Failed to load products');
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error('Failed to load products');
      }
  };
  const fetchOrders = async () => {
    const params = {}; Object.entries(orderFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    const res = await axios.get(`${API_URL}/orders/admin`, { headers: authHeaders, params }); 
    setOrders(res.data);
  };
  const fetchUsers = async () => {
    const params = {}; Object.entries(userFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    const res = await axios.get(`${API_URL}/user/admin/users`, { headers: authHeaders, params }); setUsers(res.data);
  };
  const fetchContacts = async () => {
    const params = {}; Object.entries(contactFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    const res = await axios.get(`${API_URL}/contact/admin`, { headers: authHeaders, params }); setContacts(res.data);
  };

  useEffect(() => { fetchProducts().catch(() => toast.error('Failed to load products')); }, [productFilters]);
  useEffect(() => { fetchOrders().catch(() => toast.error('Failed to load orders')); }, [orderFilters]);
  useEffect(() => { fetchUsers().catch(() => toast.error('Failed to load users')); }, [userFilters]);
  useEffect(() => { fetchContacts().catch(() => toast.error('Failed to load contacts')); }, [contactFilters]);

  const stats = [
    { title: 'Total Products', value: products.length, icon: Package, color: 'bg-rose-500' },
    { title: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'Total Revenue', value: `₹${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(0)}`, icon: DollarSign, color: 'bg-yellow-500' },
    { title: 'Total Users', value: users.length, icon: Users, color: 'bg-purple-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToExcel = (rows, filename) => {
    try { const worksheet = XLSX.utils.json_to_sheet(rows); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, 'Data'); XLSX.writeFile(workbook, `${filename}.xlsx`); } catch { toast.error('Export failed'); }
  };

  // Products CRUD
  const saveProduct = async (data) => {
    try {
      const form = new FormData(); 
      Object.entries(data).forEach(([k,v]) => { 
        if (k === 'images') { 
          if (Array.isArray(v) && v.length > 0) {
            v.forEach(file => form.append('images', file)); 
          }
        } else { 
          form.append(k, v); 
        } 
      });
      
      // IMPORTANT: Do NOT manually set Content-Type for FormData, 
      // let axios/browser handle it to include the boundary.
      const headers = { ...authHeaders }; 
      
      if (editingProduct) { 
        const res = await axios.put(`${API_URL}/products/${editingProduct._id}`, form, { headers }); 
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p)); 
        toast.success('Product updated successfully'); 
      } else { 
        const res = await axios.post(`${API_URL}/products`, form, { headers }); 
        setProducts([res.data, ...products]); 
        toast.success('Product created successfully'); 
      }
      setShowProductModal(false); 
      setEditingProduct(null);
    } catch (err) { 
      console.error("Save Product Error:", err);
      toast.error(err.response?.data?.message || 'Save failed. Check console.'); 
    }
  };
  const deleteProduct = async (id) => { if (!confirm('Delete this product?')) return; try { await axios.delete(`${API_URL}/products/${id}`, { headers: authHeaders }); setProducts(products.filter(p => p._id !== id)); toast.success('Product deleted'); } catch { toast.error('Delete failed'); } };

  // Orders CRUD
  const saveOrder = async (data) => {
    try { if (editingOrder) { const res = await axios.put(`${API_URL}/orders/admin/${editingOrder._id}`, data, { headers: authHeaders }); setOrders(orders.map(o => o._id === editingOrder._id ? res.data : o)); toast.success('Order updated'); } else { const res = await axios.post(`${API_URL}/orders/admin`, data, { headers: authHeaders }); setOrders([res.data, ...orders]); toast.success('Order created'); } setShowOrderModal(false); setEditingOrder(null); } catch { toast.error('Save failed'); }
  };
  const deleteOrder = async (id) => { if (!confirm('Delete this order?')) return; try { await axios.delete(`${API_URL}/orders/admin/${id}`, { headers: authHeaders }); setOrders(orders.filter(o => o._id !== id)); toast.success('Order deleted'); } catch { toast.error('Delete failed'); } };
  const changeOrderStatus = async (orderId, newStatus) => { try { const res = await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus }, { headers: authHeaders }); setOrders(orders.map(o => o._id === orderId ? res.data : o)); toast.success('Order status updated'); } catch { toast.error('Failed to update order'); } };

  // Users CRUD
  const saveUser = async (data) => {
    try {
      const form = new FormData(); Object.entries(data).forEach(([k,v]) => { if (v !== undefined && v !== null) form.append(k, v); });
      const headers = { ...authHeaders, 'Content-Type': 'multipart/form-data' };
      if (editingUser) { const res = await axios.put(`${API_URL}/user/admin/users/${editingUser._id}`, data.password ? form : (()=>{ const f=new FormData(); ['name','email','role','phone'].forEach(k=>f.append(k,data[k]||'')); if (data.profilePicture) f.append('profilePicture', data.profilePicture); return f; })(), { headers }); setUsers(users.map(u => u._id === editingUser._id ? res.data : u)); toast.success('User updated'); }
      else { const res = await axios.post(`${API_URL}/user/admin/users`, form, { headers }); setUsers([res.data, ...users]); toast.success('User created'); }
      setShowUserModal(false); setEditingUser(null);
    } catch { toast.error('Save failed'); }
  };
  const deleteUser = async (id) => { if (!confirm('Delete this user?')) return; try { await axios.delete(`${API_URL}/user/admin/users/${id}`, { headers: authHeaders }); setUsers(users.filter(u => u._id !== id)); toast.success('User deleted'); } catch { toast.error('Delete failed'); } };

  // Contacts CRUD
  const saveContact = async (data) => {
    try {
      if (editingContact) { const res = await axios.put(`${API_URL}/contact/admin/${editingContact._id}`, data, { headers: authHeaders }); setContacts(contacts.map(c => c._id === editingContact._id ? res.data : c)); toast.success('Contact updated'); }
      else { const res = await axios.post(`${API_URL}/contact`, data); setContacts([res.data, ...contacts]); toast.success('Contact created'); }
      setShowContactModal(false); setEditingContact(null);
    } catch { toast.error('Save failed'); }
  };
  const deleteContact = async (id) => { if (!confirm('Delete this contact?')) return; try { await axios.delete(`${API_URL}/contact/admin/${id}`, { headers: authHeaders }); setContacts(contacts.filter(c => c._id !== id)); toast.success('Contact deleted'); } catch { toast.error('Delete failed'); } };

  return (
    <div className="min-h-screen bg-fashion-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-gray-600 hover:text-rose-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Store
        </button>

        <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your e-commerce platform</p>
        </div>
        
        <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] mb-8">
          <nav className="flex flex-wrap gap-4">
            {['overview', 'products', 'orders', 'users', 'contacts'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`py-3 px-6 rounded-xl font-medium text-sm capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-rose-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6 flex items-center hover:bg-white/50 transition-all">
                <div className={`${stat.color} p-3 rounded-xl shadow-lg`}><stat.icon className="h-6 w-6 text-white" /></div>
                <div className="ml-4"><p className="text-sm font-medium text-gray-600">{stat.title}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap gap-3">
                <input className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2 w-48 placeholder-gray-500" placeholder="Search products..." value={productFilters.q} onChange={(e)=>setProductFilters({...productFilters,q:e.target.value})} />
                <select className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2" value={productFilters.mainCategory} onChange={(e)=>setProductFilters({...productFilters,mainCategory:e.target.value})}><option value="">All Main Categories</option><option value="Men">Men</option><option value="Women">Women</option></select>
                <select className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2" value={productFilters.subCategory} onChange={(e)=>setProductFilters({...productFilters,subCategory:e.target.value})}><option value="">All Sub Categories</option><option value="TOP">TOP</option><option value="LOWER">LOWER</option><option value="SAREE">SAREE</option></select>
                <input className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2 w-24" placeholder="Min ₹" type="number" value={productFilters.minPrice} onChange={(e)=>setProductFilters({...productFilters,minPrice:e.target.value})} />
                <input className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2 w-24" placeholder="Max ₹" type="number" value={productFilters.maxPrice} onChange={(e)=>setProductFilters({...productFilters,maxPrice:e.target.value})} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => exportToExcel(products, 'products') } className="border border-white/50 bg-white/40 backdrop-blur px-4 py-2 rounded-xl hover:bg-white/60 transition-all">Export</button>
                <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-rose-700 transition-all shadow-lg"><Plus className="h-5 w-5 mr-2" />Add Product</button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    {['Image', 'Brand', 'Title', 'Main Category', 'Sub Category', 'Price', 'Sizes', 'Stock', 'Actions'].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product._id} className="hover:bg-white/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={product.images?.[0] ? `http://localhost:4000${product.images[0]}` : 'https://placehold.co/60x60?text=No+Image'} alt={product.title} className="h-12 w-12 object-cover rounded-lg" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-rose-600 text-sm">{product.brand || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.mainCategory || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.subCategory || product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.isFreeSize ? (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Free Size</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {product.sizes?.map(sizeObj => (
                              <span key={sizeObj.size} className={`text-xs px-2 py-1 rounded ${
                                sizeObj.qty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {sizeObj.size}({sizeObj.qty})
                              </span>
                            )) || <span className="text-gray-400">No sizes</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="text-rose-600 hover:text-rose-700"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteProduct(product._id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap gap-3">
                <input className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2 w-48 placeholder-gray-500" placeholder="Search orders..." value={orderFilters.q} onChange={(e)=>setOrderFilters({...orderFilters,q:e.target.value})} />
                <select className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2" value={orderFilters.status} onChange={(e)=>setOrderFilters({...orderFilters,status:e.target.value})}><option value="">All Status</option>{['paid','shipped','delivered','failed','cancelled'].map(s=> <option key={s} value={s}>{s}</option>)}</select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => exportToExcel(orders, 'orders')} className="border border-white/50 bg-white/40 backdrop-blur px-4 py-2 rounded-xl hover:bg-white/60 transition-all">Export</button>
                <button onClick={() => { setEditingOrder(null); setShowOrderModal(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-rose-700 transition-all shadow-lg"><Plus className="h-5 w-5 mr-2" />Add Order</button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    {['ID', 'User', 'Total', 'Status', 'Actions'].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-white/20">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{order._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{order.user?.name || 'Unknown User'}</p>
                          <p className="text-gray-500">{order.user?.email || order.user}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">₹{order.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setViewingOrder(order)} className="text-rose-600 hover:text-rose-700">View</button>
                          <button onClick={() => { setEditingOrder(order); setShowOrderModal(true); }} className="text-rose-600 hover:text-rose-700"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteOrder(order._id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap gap-3">
                <input className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2 w-48 placeholder-gray-500" placeholder="Search users..." value={userFilters.q} onChange={(e)=>setUserFilters({...userFilters,q:e.target.value})} />
                <select className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2" value={userFilters.role} onChange={(e)=>setUserFilters({...userFilters,role:e.target.value})}><option value="">All Roles</option><option value="user">user</option><option value="admin">admin</option></select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => exportToExcel(users, 'users')} className="border border-white/50 bg-white/40 backdrop-blur px-4 py-2 rounded-xl hover:bg-white/60 transition-all">Export</button>
                <button onClick={() => { setEditingUser(null); setShowUserModal(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-rose-700 transition-all shadow-lg"><Plus className="h-5 w-5 mr-2" />Add User</button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    {['User', 'Phone', 'Role', 'Actions'].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-white/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={user.profilePicture ? `http://localhost:4000${user.profilePicture}` : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'} alt={user.name} className="h-10 w-10 rounded-full mr-4"/>
                          <div className="text-sm font-medium text-gray-900">{user.name}<p className="text-xs text-gray-500">{user.email}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="text-rose-600 hover:text-rose-700"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap gap-3">
                <input className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2 w-48 placeholder-gray-500" placeholder="Search contacts..." value={contactFilters.q} onChange={(e)=>setContactFilters({...contactFilters,q:e.target.value})} />
                <select className="border border-white/50 bg-white/40 backdrop-blur rounded-xl px-4 py-2" value={contactFilters.status} onChange={(e)=>setContactFilters({...contactFilters,status:e.target.value})}><option value="">All Status</option><option value="open">open</option><option value="in_progress">in_progress</option><option value="closed">closed</option></select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => exportToExcel(contacts, 'contacts')} className="border border-white/50 bg-white/40 backdrop-blur px-4 py-2 rounded-xl hover:bg-white/60 transition-all">Export</button>
                <button onClick={() => { setEditingContact(null); setShowContactModal(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-rose-700 transition-all shadow-lg"><Plus className="h-5 w-5 mr-2" />Add Contact</button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    {['Name', 'Email', 'Subject', 'Status', 'Actions'].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map(c => (
                    <tr key={c._id} className="hover:bg-white/20">
                      <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{c.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{c.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{c.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-rose-600 hover:text-rose-700"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteContact(c._id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl border border-white/40 bg-white backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold">{editingProduct ? 'Edit' : 'Add'} Product</h2>
                <ProductForm initial={editingProduct} onCancel={()=>{setShowProductModal(false);setEditingProduct(null);}} onSave={saveProduct} />
              </div>
            </div>
          </div>
        )}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl border border-white/40 bg-white backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold">{editingUser ? 'Edit' : 'Add'} User</h2>
                <UserForm initial={editingUser} onCancel={()=>{setShowUserModal(false);setEditingUser(null);}} onSave={saveUser} />
              </div>
            </div>
          </div>
        )}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl border border-white/40 bg-white backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold">{editingOrder ? 'Edit' : 'Add'} Order</h2>
                <OrderForm initial={editingOrder} onCancel={()=>{setShowOrderModal(false);setEditingOrder(null);}} onSave={saveOrder} />
              </div>
            </div>
          </div>
        )}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl border border-white/40 bg-white backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold">{editingContact ? 'Edit' : 'Add'} Contact</h2>
                <ContactForm initial={editingContact} onCancel={()=>{setShowContactModal(false);setEditingContact(null);}} onSave={saveContact} />
              </div>
            </div>
          </div>
        )}

        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl border border-white/40 bg-white backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <button onClick={() => setViewingOrder(null)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>
                
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold">
                      {viewingOrder.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{viewingOrder.user?.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500">{viewingOrder.user?.email || 'No email'}</p>
                    </div>
                  </div>

                  {/* Address Info */}
                  <div className="p-4 border border-gray-100 rounded-2xl">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                    {viewingOrder.address ? (
                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="font-bold text-gray-900 text-base">{viewingOrder.address.fullName}</p>
                        <p>{viewingOrder.address.line1}</p>
                        {viewingOrder.address.line2 && <p>{viewingOrder.address.line2}</p>}
                        <p>{viewingOrder.address.city}, {viewingOrder.address.state} - {viewingOrder.address.postalCode}</p>
                        <p>{viewingOrder.address.country}</p>
                        <p className="mt-2 font-medium text-rose-600">Phone: {viewingOrder.address.phone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No address provided</p>
                    )}
                  </div>

                  {/* Items Info */}
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {(viewingOrder.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{item.name || item.product?.title || 'Product'}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} | Size: {item.size || 'N/A'}</p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="font-bold text-gray-900">Total Amount</p>
                    <p className="text-2xl font-black text-rose-600">₹{viewingOrder.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SizeInput = ({ category, sizes, setSizes, stock, setStock }) => {
  const getSizeOptions = () => {
    switch (category) {
      case 'TOP': return ['S', 'M', 'L', 'XL', 'XXL'];
      case 'LOWER': return ['28', '30', '32', '34', '36'];
      case 'SAREE': return [];
      default: return [];
    }
  };

  const handleSizeQtyChange = (size, qty) => {
    const updatedSizes = sizes.map(s => s.size === size ? { ...s, qty: Number(qty) } : s);
    const newSize = updatedSizes.find(s => s.size === size);
    if (!newSize) {
      updatedSizes.push({ size, qty: Number(qty) });
    }
    setSizes(updatedSizes.filter(s => s.qty > 0));
  };

  if (!category) return null;

  if (category === 'SAREE') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">Free Size:</span>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded text-center"
            placeholder="Qty"
          />
        </div>
      </div>
    );
  }

  const sizeOptions = getSizeOptions();
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Sizes & Stock</label>
      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
        {sizeOptions.map(size => {
          const sizeObj = sizes.find(s => s.size === size);
          return (
            <div key={size} className="flex items-center justify-between">
              <span className="font-medium">{size}:</span>
              <input
                type="number"
                min="0"
                value={sizeObj?.qty || ''}
                onChange={(e) => handleSizeQtyChange(size, e.target.value)}
                className="w-20 px-2 py-1 border rounded text-center"
                placeholder="Qty"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProductForm = ({ initial, onCancel, onSave }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    price: initial?.price || 0,
    images: [],
    mainCategory: initial?.mainCategory || '',
    subCategory: initial?.subCategory || initial?.category || '',
    brand: initial?.brand || '',
    colorsText: (initial?.colors || []).join(', '),
    stock: initial?.stock || 0,
    isFreeSize: initial?.isFreeSize || false,
    sizes: initial?.sizes || [],
    isActive: initial?.isActive ?? true
  });
  
  const submit = (e) => { 
    e.preventDefault(); 
    let totalStock = 0;
    
    if (form.subCategory === 'SAREE') {
      totalStock = Number(form.stock);
    } else {
      totalStock = form.sizes.reduce((sum, sizeObj) => sum + Number(sizeObj.qty || 0), 0);
    }
    
    const payload = { 
      title: form.title, 
      description: form.description, 
      price: Number(form.price), 
      images: form.images, 
      mainCategory: form.mainCategory,
      subCategory: form.subCategory,
      brand: form.brand, 
      sizes: JSON.stringify(form.subCategory === 'SAREE' ? [] : form.sizes),
      colors: form.colorsText.split(',').map(s=>s.trim()).filter(Boolean), 
      stock: totalStock,
      isFreeSize: form.subCategory === 'SAREE',
      isActive: Boolean(form.isActive) 
    }; 
    onSave(payload); 
  };
  
  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter product title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter brand name" value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Category <span className="text-red-500">*</span></label>
          <select className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" value={form.mainCategory} onChange={(e)=>setForm({...form,mainCategory:e.target.value})} required>
            <option value="">Select Main Category</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category <span className="text-red-500">*</span></label>
          <select className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" value={form.subCategory} onChange={(e)=>setForm({...form,subCategory:e.target.value})} required>
            <option value="">Select Sub Category</option>
            <option value="TOP">TOP</option>
            <option value="LOWER">LOWER</option>
            <option value="SAREE">SAREE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" type="number" placeholder="0" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" value={form.isActive ? 'true' : 'false'} onChange={(e)=>setForm({...form,isActive:e.target.value==='true'})}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <button 
            type="button"
            onClick={async () => {
              if (!form.title || !form.mainCategory) {
                toast.error('Please enter title and category first');
                return;
              }
              const loading = toast.loading('Generating description...');
              try {
                let imageUrl = null;
                if (form.images?.[0]) {
                  // If it's a File object (newly uploaded)
                  if (form.images[0] instanceof File) {
                    imageUrl = URL.createObjectURL(form.images[0]);
                  }
                } else if (initial?.images?.[0]) {
                  // If it's an existing image URL
                  imageUrl = `http://localhost:4000${initial.images[0]}`;
                }

                const res = await axios.post(`${API_URL}/products/generate-ai-description`, {
                  title: form.title,
                  mainCategory: form.mainCategory,
                  subCategory: form.subCategory,
                  brand: form.brand,
                  imageUrl: imageUrl
                }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                setForm({...form, description: res.data.description});
                toast.success('AI description generated!');
              } catch (err) {
                toast.error('AI generation failed');
              } finally {
                toast.dismiss(loading);
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Generate with AI
          </button>
        </div>
        <textarea className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" rows={4} placeholder="Enter product description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-bold text-gray-800">Product Images <span className="text-red-500">*</span></label>
        <div className="space-y-4">
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={(e) => {
                const newFiles = Array.from(e.target.files);
                setForm(prev => ({...prev, images: [...prev.images, ...newFiles]}));
              }} 
              required={!initial && form.images.length === 0} 
              className="border-2 border-dashed border-gray-200 rounded-3xl px-6 py-10 w-full text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition-all file:hidden" 
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 group-hover:text-rose-500">
              <Plus className="h-10 w-10 mb-2" />
              <p className="font-bold">Click or Drag to Upload Multiple Images</p>
              <p className="text-xs">Support: JPG, PNG, WEBP (Max 5MB each)</p>
            </div>
          </div>
          
          {/* Selected Files Preview with Remove Button */}
          {form.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{form.images.length} New Images Selected</span>
                <button type="button" onClick={() => setForm({...form, images: []})} className="text-[10px] font-bold text-red-500 hover:underline">Clear All</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-inner">
                {form.images.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setForm(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images (when editing) */}
          {initial?.images && initial.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Existing Product Gallery</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-rose-50/20 rounded-3xl border border-rose-100/50">
                {initial.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm grayscale-[0.5] opacity-80">
                    <img src={`http://localhost:4000${img}`} alt="existing" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/40 py-0.5 text-[7px] text-white text-center font-black uppercase tracking-tighter">On Server</div>
                  </div>
                ))}
              </div>
              {form.images.length > 0 && (
                <p className="text-[10px] text-orange-600 font-bold italic px-2">
                  ⚠️ Note: Saving will REPLACE the existing gallery with your new selection.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SizeInput category={form.subCategory} sizes={form.sizes} setSizes={(sizes) => setForm({...form, sizes})} stock={form.stock} setStock={(stock) => setForm({...form, stock})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma separated)</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Red, Blue, Green" value={form.colorsText} onChange={(e)=>setForm({...form,colorsText:e.target.value})} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" className="bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition-all shadow-lg">Save</button>
      </div>
    </form>
  );
};

const UserForm = ({ initial, onCancel, onSave }) => {
  const [form, setForm] = useState({ name: initial?.name || '', email: initial?.email || '', role: initial?.role || 'user', phone: initial?.phone || '', password: '' });
  const [file, setFile] = useState(null);
  return (
    <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); const data = {...form}; if (!data.password) delete data.password; if (file) data.profilePicture = file; onSave(data);}}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" type="email" placeholder="Enter email address" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter phone number" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
        <select className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} required>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password {!initial && <span className="text-red-500">*</span>}</label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" type="password" placeholder="Enter password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required={!initial} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" className="bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition-all shadow-lg">Save</button>
      </div>
    </form>
  );
};

const OrderForm = ({ initial, onCancel, onSave }) => {
  const [form, setForm] = useState({ 
    user: initial?.user || '', 
    itemsText: initial ? JSON.stringify(initial.items) : '[]', 
    currency: initial?.currency || 'inr', 
    status: initial?.status || 'pending', 
    fullName: initial?.address?.fullName || '', 
    line1: initial?.address?.line1 || '', 
    line2: initial?.address?.line2 || '', 
    city: initial?.address?.city || '', 
    state: initial?.address?.state || '', 
    postalCode: initial?.address?.postalCode || '', 
    country: initial?.address?.country || '', 
    phone: initial?.address?.phone || '' 
  });
  const submit = (e) => { e.preventDefault(); let items = []; try { items = JSON.parse(form.itemsText); } catch { toast.error('Items must be valid JSON'); return; } const address = { fullName: form.fullName, line1: form.line1, line2: form.line2, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country, phone: form.phone }; onSave({ user: form.user, items, currency: form.currency, status: form.status, address }); };
  return (
    <form className="space-y-6" onSubmit={submit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">User ID <span className="text-red-500">*</span></label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter user ID" value={form.user} onChange={(e)=>setForm({...form,user:e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items JSON <span className="text-red-500">*</span></label>
        <textarea className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" rows={5} placeholder='[{"product":"<productId>","quantity":1}]' value={form.itemsText} onChange={(e)=>setForm({...form,itemsText:e.target.value})} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" value={form.currency} onChange={(e)=>setForm({...form,currency:e.target.value})}>
            <option value="inr">INR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
            {['paid','shipped','delivered','failed','cancelled'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter full name" value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter phone number" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter address line 1" value={form.line1} onChange={(e)=>setForm({...form,line1:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter address line 2" value={form.line2} onChange={(e)=>setForm({...form,line2:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter city" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter state" value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter postal code" value={form.postalCode} onChange={(e)=>setForm({...form,postalCode:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter country" value={form.country} onChange={(e)=>setForm({...form,country:e.target.value})} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" className="bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition-all shadow-lg">Save</button>
      </div>
    </form>
  );
};

const ContactForm = ({ initial, onCancel, onSave }) => {
  const [form, setForm] = useState({ name: initial?.name || '', email: initial?.email || '', subject: initial?.subject || '', message: initial?.message || '', status: initial?.status || 'open' });
  return (
    <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); onSave(form);}}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" type="email" placeholder="Enter email address" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
        <input className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" placeholder="Enter subject" value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
        <textarea className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" rows={5} placeholder="Enter your message" value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
        <button type="submit" className="bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition-all shadow-lg">Save</button>
      </div>
    </form>
  );
};

export default AdminDashboard;