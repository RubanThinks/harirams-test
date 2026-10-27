import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { AccountProvider } from "@/context/AccountContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import SearchPage from "@/pages/SearchPage";
import AccountLoginPage from "@/pages/AccountLoginPage";
import AccountPage from "@/pages/AccountPage";
import WhyHariramPage from "@/pages/WhyHariramPage";
import FaqPage from "@/pages/FaqPage";
import ContentPage from "@/pages/ContentPage";
import ContactPage from "@/pages/ContactPage";
import FeedbackPage from "@/pages/FeedbackPage";
import ScrollToTop from "@/components/ScrollToTop";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartBubbleNotification from "@/components/CartBubbleNotification";

import AdminLoginPage from "@/admin/AdminLoginPage";
import AdminLayout from "@/admin/AdminLayout";
import AdminDashboardPage from "@/admin/AdminDashboardPage";
import AdminProductsPage from "@/admin/AdminProductsPage";
import AdminShippingPage from "@/admin/AdminShippingPage";
import AdminPendingOrdersPage from "@/admin/AdminPendingOrdersPage";
import AdminCompletedOrdersPage from "@/admin/AdminCompletedOrdersPage";
import AdminConfigFilesPage from "@/admin/AdminConfigFilesPage";
import LegalPage from "@/pages/LegalPage";

import "@/App.css";

function StorefrontLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}

function AdminChrome({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AccountProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-center" richColors closeButton />
            <CartBubbleNotification />
            <Routes>
              {/* Public storefront */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<StorefrontLayout><ShopPage /></StorefrontLayout>} />
              <Route path="/checkout" element={<StorefrontLayout><CheckoutPage /></StorefrontLayout>} />
              <Route path="/order/:id" element={<StorefrontLayout><OrderConfirmationPage /></StorefrontLayout>} />
              <Route path="/search" element={<StorefrontLayout><SearchPage /></StorefrontLayout>} />
              <Route path="/account/login" element={<StorefrontLayout><AccountLoginPage /></StorefrontLayout>} />
              <Route path="/account" element={<StorefrontLayout><AccountPage /></StorefrontLayout>} />
              <Route path="/feedback" element={<StorefrontLayout><FeedbackPage /></StorefrontLayout>} />

              {/* Content & Heritage pages */}
              <Route path="/why-hariram" element={<StorefrontLayout><WhyHariramPage /></StorefrontLayout>} />
              <Route path="/recipes" element={<StorefrontLayout><ContentPage /></StorefrontLayout>} />
              <Route path="/faq" element={<StorefrontLayout><FaqPage /></StorefrontLayout>} />
              <Route path="/contact" element={<StorefrontLayout><ContactPage /></StorefrontLayout>} />

              {/* Legal pages (backed by /api/legal/{id}) */}
              <Route path="/terms-and-conditions" element={<StorefrontLayout><LegalPage /></StorefrontLayout>} />
              <Route path="/privacy-policy" element={<StorefrontLayout><LegalPage /></StorefrontLayout>} />
              <Route path="/returns-refunds" element={<StorefrontLayout><LegalPage /></StorefrontLayout>} />
              <Route path="/shipping-delivery" element={<StorefrontLayout><LegalPage /></StorefrontLayout>} />
              <Route path="/payment-policy" element={<StorefrontLayout><LegalPage /></StorefrontLayout>} />
              <Route path="/legal/:slug" element={<StorefrontLayout><LegalPage /></StorefrontLayout>} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminChrome><AdminDashboardPage /></AdminChrome>} />
              <Route path="/admin/products" element={<AdminChrome><AdminProductsPage /></AdminChrome>} />
              <Route path="/admin/shipping" element={<AdminChrome><AdminShippingPage /></AdminChrome>} />
              <Route path="/admin/config" element={<AdminChrome><AdminConfigFilesPage /></AdminChrome>} />
              <Route path="/admin/orders/pending" element={<AdminChrome><AdminPendingOrdersPage /></AdminChrome>} />
              <Route path="/admin/orders/completed" element={<AdminChrome><AdminCompletedOrdersPage /></AdminChrome>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AccountProvider>
    </AdminAuthProvider>
  );
}
