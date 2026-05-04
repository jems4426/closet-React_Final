import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // Try to verify token with backend, but fallback to saved user if server is down
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch((error) => {
        console.warn('Token verification failed:', error.message);
        // Fallback to saved user data if server is unreachable
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const updateUserInStorage = (updatedUser, token) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user: userData } = response.data;
      updateUserInStorage(userData, token);
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully.');
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { token, user: newUser } = response.data;
      updateUserInStorage(newUser, token);
      toast.success(`Welcome, ${newUser.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateUser = async (updatedData) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const isFormData = (typeof FormData !== 'undefined') && (updatedData instanceof FormData);
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } : { Authorization: `Bearer ${token}` };
      const res = await axios.put(`${API_URL}/user/me`, updatedData, { headers });
      updateUserInStorage(res.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUser,
    changePassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
