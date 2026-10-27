import React, { useEffect } from "react";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import BenefitsStrip from "@/components/BenefitsStrip";
import ProductGrid from "@/components/ProductGrid";
import HeritageProcess from "@/components/HeritageProcess";
import PurityComparison from "@/components/PurityComparison";
import CustomerReviews from "@/components/CustomerReviews";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useConfig } from "@/hooks/useConfig";

export default function HomePage() {
  const { data: seo } = useConfig("seo");

  useEffect(() => {
    if (!seo?.home) return;
    document.title = seo.home.title;
    setMeta("description", seo.home.description);
    setMeta("keywords", (seo.home.keywords || []).join(", "));
    setLink("canonical", seo.home.canonical);
    setMeta("og:title", seo.home.title, "property");
    setMeta("og:description", seo.home.description, "property");
    setMeta("og:image", seo.home.ogImage, "property");
    setMeta("robots", seo.home.robots);
  }, [seo]);

  return (
    <div data-testid="home-page">
      <Header />
      <main>
        <HeroCarousel />
        <BenefitsStrip />
        <ProductGrid />
        <HeritageProcess />
        <PurityComparison />
        <CustomerReviews />
        <FaqSection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
