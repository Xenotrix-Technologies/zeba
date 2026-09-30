import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import StickyMobileBar from './components/StickyMobileBar';
import WhatsAppButton from './components/WhatsAppButton';

// Public Storefront Pages (Home loaded eagerly for immediate LCP, others lazy-loaded)
import Home from './pages/Home';
const About = lazy(() => import('./pages/About'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Contact = lazy(() => import('./pages/Contact'));
const CustomerLogin = lazy(() => import('./pages/CustomerLogin'));
const CustomerAccount = lazy(() => import('./pages/CustomerAccount'));

// Legal Pages (Lazy loaded)
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const ShippingPolicy = lazy(() => import('./pages/legal/ShippingPolicy'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'));

// Admin Layout & Pages (Lazy loaded for massive bundle reduction)
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="w-10 h-10 border-3 border-brand-brightPink border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-[#805A82]">Loading ZEBA Care...</span>
    </div>
  );
}

function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
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
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/track/:orderNumber" element={<OrderTracking />} />
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
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLogin />
            </Suspense>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          }
        >
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
              <Link
                to="/"
                className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity"
              >
                Go Home
              </Link>
            </div>
          }
        />
      </Routes>
    </>
  );
}
