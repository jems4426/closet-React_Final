import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Closet</h3>
            <p className="text-gray-300 mb-4">
              Your ultimate fashion destination for trendy clothing.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/profile" className="text-gray-300 hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/cart" className="text-gray-300 hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/wishlist" className="text-gray-300 hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/orders" className="text-gray-300 hover:text-white transition-colors">Order History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-gray-300">support@closet.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 Closet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
