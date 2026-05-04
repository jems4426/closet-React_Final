import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ShoppingBag, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-5xl w-full mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Gradient Panel */}
        <div className="md:w-2/5 bg-auth-gradient p-12 text-white flex flex-col justify-between relative">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-12">
              <ShoppingBag className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tighter uppercase italic">Closet</span>
            </div>
            
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">
              Welcome back to your Closet
            </h1>
            <p className="text-lg text-rose-50/90 mb-8 leading-relaxed">
              Sign in to continue exploring curated looks, wishlist your favourites, and checkout in a few clicks.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Secure login with your Closet account</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Access orders, wishlist and personalized picks</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-12 relative z-10">
             <Link to="/admin-login" className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/20 text-sm font-semibold backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              <span>Admin Access</span>
            </Link>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-3/5 p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Sign in to closet</h2>
              <p className="text-gray-500">Welcome back! Please enter your details.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fadeIn" role="alert">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                    placeholder="Enter your Email"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Password
                  </label>
                  <Link to="#" className="text-xs font-bold text-rose-500 hover:text-rose-600">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl bg-rose-600 text-white font-bold text-lg shadow-xl shadow-rose-200 hover:bg-rose-700 hover:shadow-2xl hover:translate-y-[-2px] transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account? <Link to="/register" className="text-rose-500 font-bold hover:underline">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
