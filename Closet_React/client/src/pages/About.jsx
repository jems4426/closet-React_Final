import React from 'react';
import { Building, Users, Target, ArrowLeft, Heart, Award, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

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
            About <span className="text-rose-600">Closet</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your ultimate fashion destination for trendy clothing and timeless classics. 
            We believe fashion should be accessible, sustainable, and empowering.
          </p>
        </div>

        {/* Mission Section */}
        <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-12 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              To provide high-quality, stylish clothing that makes you feel confident and look your best, 
              while promoting sustainable and ethical fashion practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-8 hover:bg-white/30 transition-all">
                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-rose-500 text-white mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Building className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Story</h3>
                <p className="text-gray-600">
                  Founded in 2025, Closet started as a small boutique with a big dream: 
                  to revolutionize the way people shop for clothes online with a focus on quality and style.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-8 hover:bg-white/30 transition-all">
                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-amber-500 text-white mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Team</h3>
                <p className="text-gray-600">
                  We are a passionate team of fashion lovers, designers, and tech enthusiasts 
                  dedicated to creating an exceptional shopping experience for you.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-8 hover:bg-white/30 transition-all">
                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-purple-500 text-white mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To become the leading online destination for conscious consumers who value 
                  style, quality, and ethical production in their fashion choices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-12 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Closet?</h2>
            <p className="text-lg text-gray-600">
              We're committed to providing you with the best fashion experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-rose-500 text-white">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Quality First</h4>
                <p className="text-gray-600">
                  Every piece in our collection is carefully selected for quality, comfort, and style.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-500 text-white">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Sustainable Fashion</h4>
                <p className="text-gray-600">
                  We partner with ethical manufacturers and promote sustainable fashion practices.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500 text-white">
                  <Truck className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h4>
                <p className="text-gray-600">
                  Quick and reliable shipping to get your favorite pieces to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-rose-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-rose-600 mb-2">500+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-rose-600 mb-2">50+</div>
              <div className="text-gray-600">Brands</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-rose-600 mb-2">99%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;