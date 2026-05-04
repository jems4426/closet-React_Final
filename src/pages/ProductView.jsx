import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [eligibleToRate, setEligibleToRate] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
        if (token) {
          const elig = await axios.get(`${API_URL}/products/${id}/rating-eligibility`, { headers: authHeaders });
          setEligibleToRate(elig.data.eligible);
        }
      } catch {
        toast.error('Product not found');
      }
    };
    load();
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <button onClick={() => navigate('/')} className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700">
          Back to Products
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size first');
      return;
    }
    if (selectedSize) {
      const sizeObj = product.sizes.find(s => s.size === selectedSize);
      if (!sizeObj || sizeObj.qty <= 0) {
        toast.error('Selected size is out of stock');
        return;
      }
    }
    addToCart(product, selectedSize || null, quantity);
    toast.success(`${product.title} added to cart!`);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const submitRating = async () => {
    if (!eligibleToRate) {
      toast.error('You can only rate shipped/delivered purchases');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/products/${product._id}/rate`, { stars, comment }, { headers: authHeaders });
      setProduct(prev => ({ 
        ...prev, 
        averageRating: res.data.averageRating, 
        numRatings: res.data.numRatings, 
        ratings: res.data.ratings 
      }));
      setComment('');
      setStars(5);
      toast.success('Thank you for your rating!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Rating failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col space-y-4">
          <div className="relative group overflow-hidden rounded-3xl bg-gray-50 aspect-[4/5] lg:aspect-square flex items-center justify-center shadow-sm border border-gray-100">
            {/* Main Image */}
            <img 
              src={product.images && product.images.length > 0 
                ? getImageUrl(product.images[currentImageIndex]) 
                : 'https://placehold.co/600x800?text=No+Image'} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x800?text=No+Image'; }}
            />

            {/* Navigation Arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-900 p-3 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-900 p-3 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentImageIndex ? 'w-8 bg-rose-600' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                    index === currentImageIndex ? 'border-rose-600 ring-4 ring-rose-50' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.title} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }}
                  />
                  {index !== currentImageIndex && (
                    <div className="absolute inset-0 bg-white/10" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-rose-600 font-bold text-lg mb-1">{product.brand || 'Premium Brand'}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5" fill={i < Math.round(product.averageRating || 0) ? "#FACC15" : "none"} color={i < Math.round(product.averageRating || 0) ? "#FACC15" : "#D1D5DB"} />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">{(product.averageRating || 0).toFixed(1)} ({product.numRatings || 0} reviews)</span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-rose-600">₹{product.price}</span>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Size <span className="text-red-500">*</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(sizeObj => {
                  const isAvailable = sizeObj.qty > 0;
                  return (
                    <div key={sizeObj.size} className="flex flex-col items-center">
                      <button
                        onClick={() => isAvailable && setSelectedSize(sizeObj.size)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all relative ${
                          selectedSize === sizeObj.size
                            ? 'border-rose-600 bg-rose-600 text-white'
                            : isAvailable
                            ? 'border-gray-300 text-gray-700 hover:border-rose-600'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {sizeObj.size}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                          </div>
                        )}
                      </button>
                      {isAvailable && sizeObj.qty < 10 && (
                        <span className="text-xs text-orange-600 mt-1">Only {sizeObj.qty} left</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 border rounded-lg font-medium transition-colors ${selectedColor === color ? 'border-rose-600 bg-rose-600 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 border border-gray-300 rounded-l-lg hover:bg-gray-100">-</button>
              <span className="px-4 py-2 border-t border-b border-gray-300 bg-gray-50">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 border border-gray-300 rounded-r-lg hover:bg-gray-100">+</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button 
              onClick={() => {
                if (isInCart(product._id, selectedSize)) {
                  navigate('/cart');
                } else {
                  handleAddToCart();
                }
              }} 
              disabled={product.sizes && product.sizes.length > 0 ? (!selectedSize || !product.sizes.find(s => s.size === selectedSize && s.qty > 0)) : product.stock <= 0} 
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                product.sizes && product.sizes.length > 0 ? 
                  (!selectedSize ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                  product.sizes.find(s => s.size === selectedSize && s.qty > 0) ? 'bg-rose-600 text-white hover:bg-rose-700' : 
                  'bg-red-100 text-red-600 border border-red-200 cursor-not-allowed') :
                  (product.stock > 0 ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-red-100 text-red-600 border border-red-200 cursor-not-allowed')
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{
                product.sizes && product.sizes.length > 0 ? 
                  (!selectedSize ? 'Select Size' : 
                  (isInCart(product._id, selectedSize) ? 'Added / Go to Cart' :
                  (product.sizes.find(s => s.size === selectedSize && s.qty > 0) ? 'Add to Cart' : 'Out of Stock'))) :
                  (product.stock > 0 ? (isInCart(product._id) ? 'Added / Go to Cart' : 'Add to Cart') : 'Out of Stock')
              }</span>
            </button>
            <button onClick={handleWishlistToggle} className={`px-6 py-3 border rounded-lg font-medium transition-colors ${isInWishlist(product._id) ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>
              <Heart className={`h-5 w-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div><span className="font-semibold">Category: </span><span className="text-gray-700">{product.category}</span></div>
            <div><span className="font-semibold">Availability: </span><span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            
            {eligibleToRate && (
              <div className="bg-gray-50 rounded-3xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-3">Rate this product</h3>
                <div className="flex items-center gap-2 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setStars(s)} type="button" className="transition-transform hover:scale-110">
                      <Star className="h-8 w-8" fill={s <= stars ? "#FACC15" : "none"} color={s <= stars ? "#FACC15" : "#D1D5DB"} />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  className="w-full border-0 bg-white rounded-2xl p-4 mb-4 shadow-sm focus:ring-2 focus:ring-rose-500" 
                  placeholder="Share your experience with this product..." 
                  rows={3}
                />
                <button onClick={submitRating} className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
                  Submit Review
                </button>
              </div>
            )}

            <div className="space-y-6">
              {product.ratings && product.ratings.length > 0 ? (
                product.ratings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((rev, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-gray-900">{rev.user?.name || 'Verified Buyer'}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4" fill={i < rev.stars ? "#FACC15" : "none"} color={i < rev.stars ? "#FACC15" : "#D1D5DB"} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{rev.comment || 'No comment provided.'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-3xl">
                  <p className="text-gray-500">No reviews yet. Be the first to rate this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;