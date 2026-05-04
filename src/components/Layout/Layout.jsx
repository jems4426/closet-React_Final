import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/admin-login', '/admin-register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-fashion-gradient flex flex-col">
      {!isAuthPage && <Navbar />}
      <main className={`flex-1 ${!isAuthPage ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default Layout;
