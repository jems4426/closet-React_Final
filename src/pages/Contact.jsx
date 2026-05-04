import React, { useState } from 'react';
import { Mail, Phone, MapPin, ArrowLeft, Send, Clock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Contact = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/contact`, form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (e) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fashion-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-rose-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Store
        </button>

        {/* Hero Section */}
        <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-12 mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Get in <span className="text-rose-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you! Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl 
shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6 h-auto self-start">

            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-rose-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Send us a Message</h2>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email address"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What is this about?"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us more about your inquiry..."
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2 px-4 rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-lg transition-all font-medium disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-rose-500 text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">support@closet.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-500 text-white">
                      <Phone className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9AM-9PM IST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500 text-white">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">Dhamendra Road 5<br />Rajkot Gujarat 360005<br />India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-rose-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Stoe Business Hours</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium text-gray-900">9:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium text-gray-900">9:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium text-gray-900">Closed</span>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Help</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Order Issues?</h4>
                  <p className="text-sm text-gray-600">Check your order status in your account or contact us with your order number.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Returns & Exchanges</h4>
                  <p className="text-sm text-gray-600">We offer 30-day returns on all items. See our return policy for details.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Size Guide</h4>
                  <p className="text-sm text-gray-600">Need help with sizing? Size charts are available on Google. We follow Indian Size.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;