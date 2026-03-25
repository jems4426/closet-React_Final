import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      const productId = product._id || product.id;
      if (prev.find(item => item.id === productId)) {
        toast.error('Product already in wishlist.');
        return prev;
      }
      toast.success('Added to wishlist!');
      return [...prev, {
        ...product,
        id: productId,
        name: product.title || product.name,
        image: product.images?.[0] ? `http://localhost:4000${product.images[0]}` : 'https://placehold.co/300x400?text=No+Image'
      }];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    toast.success('Removed from wishlist.');
  };
  
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId || item._id === productId);
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
