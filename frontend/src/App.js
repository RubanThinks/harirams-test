import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { AccountProvider } from "@/context/AccountContext";
import HomePage from "@/pages/HomePage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import SearchPage from "@/pages/SearchPage";
import AccountLoginPage from "@/pages/AccountLoginPage";
import AccountPage from "@/pages/AccountPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import "@/App.css";

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}

export default function App() {
  return (
    <AccountProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors closeButton />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
            <Route path="/order/:id" element={<Layout><OrderConfirmationPage /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
            <Route path="/account/login" element={<Layout><AccountLoginPage /></Layout>} />
            <Route path="/account" element={<Layout><AccountPage /></Layout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AccountProvider>
  );
}
