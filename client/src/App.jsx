import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import StickyMobileBar from './components/StickyMobileBar';
import WhatsAppButton from './components/WhatsAppButton';

// Public Storefront Pages
import Home from './pages/Home';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Contact from './pages/Contact';
import CustomerLogin from './pages/CustomerLogin';
import CustomerAccount from './pages/CustomerAccount';

// Legal Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import ShippingPolicy from './pages/legal/ShippingPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';

function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <StickyMobileBar />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Storefront Routes */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<ProductDetail />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/contact" element={<Contact />} />

        {/* Customer Account Routes */}
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerLogin />} />
        <Route path="/account" element={<CustomerAccount />} />

        {/* Legal Policies */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/refund-return-policy" element={<RefundPolicy />} />
      </Route>

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Catch All */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-[#FFF5FA] flex flex-col items-center justify-center p-4 text-center">
            <h1 className="font-display font-black text-4xl text-brand-deepPurple">404 - Page Not Found</h1>
            <p className="text-xs text-[#805A82] mt-2">The page you are looking for does not exist.</p>
            <a href="/" className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Go Home
            </a>
          </div>
        }
      />
      </Routes>
    </>
  );
}
