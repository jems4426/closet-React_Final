import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size = null, quantity = 1) => {
    // Check stock availability
    if (product.sizes && product.sizes.length > 0) {
      if (size) {
        const sizeObj = product.sizes.find(s => s.size === size);
        if (!sizeObj || sizeObj.qty <= 0) return false;
      } else {
        return false; // Size required but not provided
      }
    } else if (product.stock <= 0) {
      return false;
    }
    
    setCartItems(prev => {
      const productId = product._id || product.id;
      const itemSize = size || 'One Size';
      const existingItem = prev.find(item => item.id === productId && item.size === itemSize);
      
      if (existingItem) {
        return prev.map(item =>
          item.id === productId && item.size === itemSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { 
        ...product, 
        id: productId,
        name: product.title || product.name,
        image: product.images?.[0] ? `http://localhost:4000${product.images[0]}` : 'https://placehold.co/80x80?text=No+Image',
        size: itemSize, 
        quantity 
      }];
    });
    return true;
  };

  const removeFromCart = (id, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (id, size = null) => {
    return cartItems.some(item => item.id === id && (size ? item.size === size : true));
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
