import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminSecret: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.adminSecret) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register-admin`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        adminSecret: formData.adminSecret
      });

      if (res.data.success) {
        toast.success('Admin account created! Please sign in.');
        navigate('/admin-login');
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-5xl w-full mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[680px]">

        {/* Left Panel */}
        <div className="md:w-2/5 bg-auth-gradient p-12 text-white flex flex-col justify-between relative">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-12">
              <ShieldCheck className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tighter uppercase">Closet</span>
            </div>

            <h1 className="text-4xl font-extrabold mb-6 leading-tight">
              Join the Closet fashion circle
            </h1>
            <p className="text-lg text-rose-50/90 mb-8 leading-relaxed">
              Create your admin account to save looks, track your orders and get personalized recommendations.
            </p>

            <ul className="space-y-4 mt-6">
              <li className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Build your wishlist and save your favourites</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Faster checkout and order tracking</span>
              </li>
            </ul>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Panel - Form */}
        <div className="md:w-3/5 p-10 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Create admin account</h2>
              <p className="text-gray-500 text-sm">Admin credentials required to proceed.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl animate-fadeIn">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                    placeholder="Enter your Email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-9 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300 text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Confirm</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-9 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300 text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Secret Key */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Admin Secret Key</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    name="adminSecret"
                    type={showSecret ? 'text' : 'password'}
                    required
                    value={formData.adminSecret}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                    placeholder="Enter admin secret key"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600" onClick={() => setShowSecret(!showSecret)}>
                    {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">Contact your system administrator for the secret key.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-2 py-4 rounded-2xl bg-rose-600 text-white font-bold text-lg shadow-xl shadow-rose-200 hover:bg-rose-700 hover:shadow-2xl hover:translate-y-[-2px] transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/admin-login" className="text-rose-500 font-bold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
