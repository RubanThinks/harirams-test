import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";
import { TESTIDS } from "@/constants/testIds";

export default function Header() {
  const { data: company } = useConfig("company");
  const { data: nav } = useConfig("navigation");
  const { count, setOpen } = useCart();
  const { isAuthed } = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const brandName = company?.brandName || "HARIRAM'S";
  const tagline = company?.tagline || "We are for you";
  const items = nav?.items || [];

  return (
    <header
      data-testid={TESTIDS.header}
      className={`sticky top-0 z-40 bg-[color:var(--brand-cream)] transition-all ${
        scrolled ? "header-scrolled" : ""
      }`}
    >
      <div className="container-brand flex items-center gap-4 lg:gap-8 py-3 lg:py-4">
        {/* Logo + brand */}
        <Link
          to="/"
          data-testid={TESTIDS.headerLogo}
          className="flex items-center gap-3 lg:gap-4 shrink-0"
          aria-label={`${brandName} — Home`}
        >
          <img
            src="/assets/logo/logo.jpeg"
            alt="Hariram's HHN Logo"
            className="h-12 w-16 lg:h-14 lg:w-20 object-contain rounded-lg"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span
              className="font-bold text-xl lg:text-3xl tracking-tight"
              style={{ color: "var(--brand-accent)", fontFamily: "'Playfair Display', serif" }}
            >
              {brandName}
            </span>
            <span className="gold-ornament">
              <span className="tagline-italic text-sm lg:text-base">{tagline}</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          data-testid={TESTIDS.headerNav}
          className="hidden lg:flex items-center gap-7 mx-auto"
          aria-label="Primary"
        >
          {items.map((item, i) => (
            <a
              key={item.title}
              href={item.url}
              data-testid={TESTIDS.headerNavItem(item.title.toLowerCase().replace(/\s+/g, "-"))}
              className={`relative text-sm font-semibold tracking-wide uppercase transition-colors hover:text-[color:var(--brand-accent)] ${
                i === 0 ? "text-[color:var(--brand-primary)]" : "text-[color:var(--brand-text)]"
              }`}
            >
              {item.title}
              {i === 0 && (
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full"
                  style={{ background: "var(--brand-secondary)" }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 lg:gap-5 ml-auto">
          <button
            data-testid={TESTIDS.headerSearch}
            onClick={() => navigate("/search")}
            className="hidden sm:inline-flex p-2 rounded-full hover:bg-[color:var(--brand-border)]/50 transition"
            aria-label="Search products"
          >
            <Search className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
          </button>
          <button
            data-testid={TESTIDS.headerAccount}
            onClick={() => navigate(isAuthed ? "/account" : "/account/login")}
            className="hidden sm:inline-flex p-2 rounded-full hover:bg-[color:var(--brand-border)]/50 transition"
            aria-label={isAuthed ? "My Account" : "Sign in"}
          >
            <User className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
          </button>
          <button
            data-testid={TESTIDS.headerCart}
            onClick={() => setOpen(true)}
            className="relative inline-flex items-center justify-center w-11 h-11 rounded-full border-2"
            style={{ borderColor: "var(--brand-secondary)", background: "var(--brand-surface)" }}
            aria-label={`Open cart (${count} items)`}
          >
            <ShoppingCart className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
            <span
              data-testid={TESTIDS.headerCartCount}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center px-1"
              style={{ background: "var(--brand-accent)" }}
            >
              {count}
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            data-testid={TESTIDS.mobileMenuBtn}
            className="lg:hidden p-2 rounded-full hover:bg-[color:var(--brand-border)]/50"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" style={{ color: "var(--brand-primary)" }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: "var(--brand-primary)" }} />
            )}
          </button>
        </div>
      </div>

      {/* Gold kolam divider */}
      <div className="container-brand"><div className="kolam-divider" /></div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <nav
          data-testid={TESTIDS.mobileMenu}
          className="lg:hidden container-brand py-4 border-t border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.title}>
                <a
                  href={item.url}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-2 text-base font-semibold uppercase tracking-wide text-[color:var(--brand-text)] hover:text-[color:var(--brand-accent)]"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
