import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Camera, Edit, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
  });
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onload = (event) => { setProfilePicture(event.target.result); };
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('phone', formData.phone);
    if (file) form.append('profilePicture', file);
    await updateUser(form);
  };

  return (
    <div className="min-h-screen bg-fashion-gradient py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-gray-600 hover:text-rose-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Store
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6 group">
                <img
                  src={getImageUrl(profilePicture, 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg')}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"
                  onError={(e) => {
                    e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';
                  }}
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-0 right-0 bg-rose-600 p-3 rounded-full cursor-pointer hover:bg-rose-700 transition-all flex items-center justify-center shadow-lg group-hover:scale-110"
                >
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    id="profile-picture-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePictureChange}
                  />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-rose-100 text-rose-800 text-sm font-medium">
                Member since 2024
              </div>
            </div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                <Edit className="h-6 w-6 mr-3 text-rose-600" />
                Edit Profile
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100/70 cursor-not-allowed text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Link
                    to="/change-password"
                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl border-2 border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all font-medium shadow-sm"
                  >
                    <Lock className="h-5 w-5 text-rose-600 mr-2" />
                    Change Password
                  </Link>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-6 rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-lg transition-all font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;