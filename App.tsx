
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { CartProvider } from './components/CartContext';
import { storage } from './services/storageService';
import { User } from './types';

// Pages
import Home from './pages/Home';
import ShopProfile from './pages/ShopProfile';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import ShopDashboard from './pages/ShopDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import Orders from './pages/Orders';
import CreateShop from './pages/CreateShop';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import WelcomeShopkeeper from './pages/WelcomeShopkeeper';
import ShopOwnerProfile from './pages/ShopOwnerProfile';
import Terms from './pages/Terms';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    storage.setCurrentUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  return (
    <CartProvider>
      <HashRouter>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop/:id" element={<ShopProfile />} />
            <Route path="/cart" element={<Cart user={user} />} />
            <Route path="/orders" element={<Orders user={user} />} />
            <Route path="/chat/:receiverId" element={<Chat />} />
            <Route path="/profile" element={<ShopOwnerProfile />} />
            <Route path="/terms" element={<Terms />} />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Auth type="login" onAuthSuccess={handleAuthSuccess} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <Auth type="register" onAuthSuccess={handleAuthSuccess} />} 
            />

            {/* Shopkeeper Routes */}
            <Route path="/welcome-shopkeeper" element={<WelcomeShopkeeper user={user} />} />
            <Route 
              path="/shop-dashboard" 
              element={<ShopDashboard user={user} />} 
            />
            <Route path="/create-shop" element={<CreateShop user={user} />} />
            <Route path="/add-product" element={<AddProduct user={user} />} />
            <Route path="/edit-product/:id" element={<EditProduct user={user} />} />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={<AdminDashboard />} 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </CartProvider>
  );
};

export default App;
