import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Camera, Lock, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState('https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      setError('Please fill in all fields');
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
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      profilePicture: profilePicturePreview
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-5xl w-full mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Left Side - Gradient Panel */}
        <div className="md:w-2/5 bg-auth-gradient p-12 text-white flex flex-col justify-between relative">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-12">
              <ShoppingBag className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tighter uppercase italic">Closet</span>
            </div>
            
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">
              Join the Closet Community
            </h1>
            <p className="text-lg text-rose-50/90 mb-8 leading-relaxed">
              Create an account to start your personalized fashion journey today.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Fast and secure account creation</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Exclusive offers and trend updates</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Personalized shopping experience</span>
              </li>
            </ul>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-3/5 p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-500">Sign up to get started.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fadeIn" role="alert">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-inner bg-gray-50 border-4 border-white">
                    <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <label htmlFor="profile-picture-upload" className="absolute -bottom-2 -right-2 bg-rose-600 p-2.5 rounded-2xl cursor-pointer hover:bg-rose-700 transition-all shadow-lg hover:scale-110 active:scale-95">
                    <Camera className="h-4 w-4 text-white" />
                    <input id="profile-picture-upload" type="file" className="hidden" accept="image/*" onChange={handlePictureChange} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
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
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
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
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-300"
                        placeholder="••••••••"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-4 py-4 rounded-2xl bg-rose-600 text-white font-bold text-lg shadow-xl shadow-rose-200 hover:bg-rose-700 hover:shadow-2xl hover:translate-y-[-2px] transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-400">
                Already have an account? <Link to="/login" className="text-rose-500 font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
