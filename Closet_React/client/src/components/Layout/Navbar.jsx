import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, Package, Heart, UserCog, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getImageUrl } from '../../utils/imageUtils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/men', name: 'Men' },
    { path: '/women', name: 'Women' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' }
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Closet
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-gray-700 hover:text-rose-600 transition-colors ${
                  isActive(link.path) ? 'text-rose-600 font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/wishlist"
                  className="relative text-gray-700 hover:text-rose-600 transition-colors"
                >
                  <Heart className="h-6 w-6" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-rose-600 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-rose-600 transition-colors"
                  >
                    <img 
                      src={user.profilePicture ? `http://localhost:4000${user.profilePicture}` : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'} 
                      alt={user.name} 
                      className="h-8 w-8 rounded-full object-cover" 
                      onError={(e) => {
                        e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';
                      }}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
                      </div>
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}>
                        <UserCog className="inline h-4 w-4 mr-2" /> Profile
                      </Link>
                      <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}>
                        <Package className="inline h-4 w-4 mr-2" /> Orders
                      </Link>
                      <Link to="/wishlist" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}>
                        <Heart className="inline h-4 w-4 mr-2" /> Wishlist
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}>
                          <LayoutDashboard className="inline h-4 w-4 mr-2" /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <LogOut className="inline h-4 w-4 mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-rose-600 transition-colors">Login</Link>
                <Link to="/register" className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">Register</Link>
              </div>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-700 hover:text-rose-600">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
            <div className="space-y-2">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} className="block text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/wishlist" className="flex items-center text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="h-5 w-5 mr-2" /> Wishlist ({wishlistItems.length})
                  </Link>
                  <Link to="/cart" className="flex items-center text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCart className="h-5 w-5 mr-2" /> Cart ({getCartCount()})
                  </Link>
                  <Link to="/profile" className="block text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="block text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                  <Link to="/wishlist" className="block text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
                  {user.role === 'admin' && <Link to="/admin" className="flex items-center text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}><LayoutDashboard className="h-5 w-5 mr-2" />Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="block text-gray-700 hover:text-rose-600 py-2 w-full text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="block text-gray-700 hover:text-rose-600 py-2" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
