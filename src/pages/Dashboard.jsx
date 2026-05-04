import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Grid, List, Star, ShoppingCart, X, Heart } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Dashboard = ({ category: pageCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = pageCategory ? { mainCategory: pageCategory } : {};
        const res = await axios.get(`${API_URL}/products`, { params });
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          toast.error(res.data.message || 'Failed to load products');
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [pageCategory]);

  const mainCategories = [
    { id: 1, name: 'All', count: products.length },
    { id: 2, name: 'Men', count: products.filter(p => p.mainCategory?.toLowerCase() === 'men').length },
    { id: 3, name: 'Women', count: products.filter(p => p.mainCategory?.toLowerCase() === 'women').length }
  ];
  const subCategories = [
    { id: 1, name: 'All', count: products.length },
    { id: 2, name: 'TOP', count: products.filter(p => (p.subCategory || '').toUpperCase() === 'TOP' || (p.category || '').toUpperCase() === 'TOP').length },
    { id: 3, name: 'LOWER', count: products.filter(p => (p.subCategory || '').toUpperCase() === 'LOWER' || (p.category || '').toUpperCase() === 'LOWER').length },
    { id: 4, name: 'SAREE', count: products.filter(p => (p.subCategory || '').toUpperCase() === 'SAREE' || (p.category || '').toUpperCase() === 'SAREE').length }
  ];
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false); // mobile drawer
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const mainCategoryMatch = pageCategory 
        ? product.mainCategory?.toLowerCase() === pageCategory.toLowerCase() 
        : (selectedMainCategory === 'All' || product.mainCategory?.toLowerCase() === selectedMainCategory.toLowerCase());
      const subCategoryMatch = selectedSubCategory === 'All' 
        || (product.subCategory || '').toLowerCase() === selectedSubCategory.toLowerCase() 
        || (product.category || '').toLowerCase() === selectedSubCategory.toLowerCase();
      
      let priceMatch = true;
      if (priceRange !== 'all') {
        const price = product.price;
        switch (priceRange) {
          case 'under500':
            priceMatch = price < 500;
            break;
          case '500-1000':
            priceMatch = price >= 500 && price <= 1000;
            break;
          case '1000-1500':
            priceMatch = price >= 1000 && price <= 1500;
            break;
          case '1500-2000':
            priceMatch = price >= 1500 && price <= 2000;
            break;
          case 'above2000':
            priceMatch = price > 2000;
            break;
          default:
            priceMatch = true;
        }
      }
      
      return mainCategoryMatch && subCategoryMatch && priceMatch;
    });
  }, [products, selectedMainCategory, selectedSubCategory, priceRange, pageCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });
  }, [filteredProducts, sortBy]);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    // If product has sizes, redirect to product page for size selection
    if (product.sizes && product.sizes.length > 0) {
      window.location.href = `/product/${product._id || product.id}`;
      return;
    }
    
    // For products without sizes, add directly to cart
    if (addToCart(product)) {
      toast.success(`${product.title} added to cart!`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleWishlistToggle = (product) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    if (isInWishlist(product._id || product.id)) {
      removeFromWishlist(product._id || product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- UI: Glass Filter Sidebar ---
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 drop-shadow-sm">
          <Filter className="h-5 w-5 mr-2 text-gray-700" />
          Filters
        </h3>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Sub Categories</h4>
          <div className="space-y-2">
            {subCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedSubCategory(category.name)}
                className={`w-full text-left px-3 py-2 rounded-xl transition ${selectedSubCategory === category.name
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-gray-800 hover:bg-rose-50'
                  }`}
              >
                <span className="inline-flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  <span className="text-xs opacity-70">{category.count}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        {!pageCategory && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Main Categories</h4>
            <div className="space-y-2">
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedMainCategory(category.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${selectedMainCategory === category.name
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-gray-800 hover:bg-rose-50'
                    }`}
                >
                  <span className="inline-flex items-center justify-between w-full">
                    <span>{category.name}</span>
                    <span className="text-xs opacity-70">{category.count}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Price Range</h4>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Prices</option>
            <option value="under500">Under ₹500</option>
            <option value="500-1000">₹500 - ₹1,000</option>
            <option value="1000-1500">₹1,000 - ₹1,500</option>
            <option value="1500-2000">₹1,500 - ₹2,000</option>
            <option value="above2000">Above ₹2,000</option>
          </select>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3">Sort By</h4>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-white/40 bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-fashion-gradient overflow-x-hidden">
      <div className="relative">


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero / Heading */}
          {!pageCategory ? (
            <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-10 mb-10">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 drop-shadow-sm">
                Welcome to Closet
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mt-3">
                Discover the latest fashion trends and timeless classics.
              </p>
              <div className="mt-6">
                <button className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 transition shadow">
                  Shop Now
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 drop-shadow-sm">
                {pageCategory}&apos;s Collection
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mt-2">
                Explore our curated selection for {pageCategory.toLowerCase()}.
              </p>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Sidebar (G4) */}
            <aside className="hidden lg:block lg:w-72 shrink-0 sticky top-20 self-start">
              <FilterSidebar />
            </aside>

            {/* Floating Filter Button (Mobile - G4) */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl text-gray-900 shadow hover:bg-white/60"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>

            {/* Mobile Overlay */}
            {isFilterOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsFilterOpen(false)}
              />
            )}

            {/* Mobile Glass Drawer */}
            <aside
              className={`lg:hidden fixed top-0 left-0 h-full w-80 z-50 transition-transform duration-300 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
              <div className="h-full overflow-y-auto p-5 border-r border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 drop-shadow-sm">Filters</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 rounded-xl hover:bg-black/5 text-gray-700"
                  >
                    <X />
                  </button>
                </div>
                <FilterSidebar />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 drop-shadow-sm">
                  Products <span className="text-gray-500">({sortedProducts.length})</span>
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl border ${viewMode === 'grid'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-white/50 bg-white/40 backdrop-blur hover:bg-white/60 text-gray-900'
                      }`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl border ${viewMode === 'list'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-white/50 bg-white/40 backdrop-blur hover:bg-white/60 text-gray-900'
                      }`}
                    aria-label="List view"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Products */}
              <div
                className={`${viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7'
                    : 'space-y-4'
                  }`}
              >
                {sortedProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className={`group rounded-3xl border border-gray-200 
    bg-white shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.9)]
    hover:shadow-[12px_12px_24px_rgba(163,177,198,0.25),-12px_-12px_24px_rgba(255,255,255,0.95)]
    transition-all duration-300 ease-out cursor-pointer relative
    ${viewMode === 'list' ? 'flex items-center p-4' : 'p-4'}
  `}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleWishlistToggle(product);
                      }}
                      className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-lg transition-all ${
                        isInWishlist(product._id || product.id)
                          ? 'bg-rose-600 text-white'
                          : 'bg-white text-gray-400 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product._id || product.id) ? 'fill-current' : ''}`} />
                    </button>
                    <Link to={`/product/${product._id || product.id}`} className={viewMode === 'list' ? 'flex items-center' : 'block'}>
                      <div className={`overflow-hidden rounded-2xl 
      ${viewMode === 'list' ? 'w-48 h-48 mr-5' : 'w-full aspect-[3/4] mb-4'}
    `}>
                        <img
                          src={product.images?.[0] ? `http://localhost:4000${product.images[0]}` : 'https://placehold.co/400x500?text=No+Image'}
                          alt={product.title || product.name}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/400x500?text=No+Image';
                          }}
                        />
                      </div>
                    </Link>

                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <Link to={`/product/${product._id || product.id}`}>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 tracking-tight group-hover:text-gray-700 transition-colors">
                          {product.title || product.name}
                        </h3>
                      </Link>

                      <p className="text-sm font-bold text-rose-600 mb-1">{product.brand || 'Premium'}</p>
                      <p className="text-xs text-gray-500 mb-2">{product.mainCategory} - {product.subCategory || product.category}</p>

                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(product.averageRating || product.rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          ({product.numRatings || product.reviews || 0})
                        </span>
                      </div>

                      <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-4' : ''}`}>
                        <span className="text-xl font-semibold text-gray-900">
                          ₹{product.price}
                        </span>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock <= 0}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all 
          ${product.stock > 0
                              ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95'
                              : 'bg-red-100 text-red-600 border border-red-200 cursor-not-allowed'
                            }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>
                            {product.stock > 0 
                              ? (isInCart(product._id || product.id) 
                                ? 'Added / Go to Cart' 
                                : (product.sizes?.length > 0 ? 'Select' : 'Add to Cart')) 
                              : 'Out of Stock'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                ))}
              </div>

              {sortedProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-700 text-lg">
                    No products found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
