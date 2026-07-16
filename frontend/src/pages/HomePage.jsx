import React, { useEffect } from "react";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import BenefitsStrip from "@/components/BenefitsStrip";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useConfig } from "@/hooks/useConfig";
import { TESTIDS } from "@/constants/testIds";

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
        <TrustBand />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function TrustBand() {
  return (
    <section className="w-full py-12 lg:py-16" style={{ background: "var(--brand-cream)" }} aria-label="Trust">
      <div className="container-brand grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        {[
          { t: "FSSAI Certified", d: "Prepared in a licensed facility" },
          { t: "From Indian Cows", d: "Sourced with care" },
          { t: "Traditional Bilona", d: "Slow-churned the old way" },
          { t: "No Preservatives", d: "Just pure, honest ghee" },
        ].map((x) => (
          <div key={x.t} className="p-4">
            <div className="text-xl lg:text-2xl mb-1" style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}>{x.t}</div>
            <div className="text-sm" style={{ color: "var(--brand-muted)" }}>{x.d}</div>
          </div>
        ))}
      </div>
    </section>
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
