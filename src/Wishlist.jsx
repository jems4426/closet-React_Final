import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
    toast.success(`${product.name} moved to cart!`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Add your favorite items to your wishlist to see them here.</p>
          <Link to="/" className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow group">
            <div className="relative">
              <Link to={`/product/${product.id}`}>
                <img 
                  src={product.image || (product.images?.[0] ? `http://localhost:4000${product.images[0]}` : 'https://placehold.co/300x400?text=No+Image')} 
                  alt={product.name || product.title} 
                  className="w-full h-64 object-contain bg-gray-50 rounded-t-lg"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x400?text=No+Image';
                  }}
                />
              </Link>
              <button onClick={() => removeFromWishlist(product.id)} className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-red-500 hover:bg-red-50">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-rose-600">{product.name || product.title}</h3>
              </Link>
              <p className="text-xl font-bold text-rose-600 mb-4">₹{product.price}</p>
              <button
                onClick={() => handleMoveToCart(product)}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-rose-600 text-white hover:bg-rose-700 disabled:bg-gray-300"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
