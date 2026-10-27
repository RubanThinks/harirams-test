import React, { useEffect, useMemo, useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";
import SlideToCartButton from "@/components/SlideToCartButton";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const { add } = useCart();

  useEffect(() => {
    apiClient.get("/products").then((r) => setProducts(r.data.products || []));
    document.title = "Search — Hariram's Pure Cow Ghee";
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) =>
      [p.name, p.variant, p.idealFor, p.description, p.family, p.sku]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(t))
    );
  }, [q, products]);

  return (
    <div data-testid={TESTIDS.searchPage} style={{ background: "var(--brand-cream)", minHeight: "100vh" }}>
      <div className="container-brand py-10 lg:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:underline"
              style={{ color: "var(--brand-primary)" }}>
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <div className="text-center mb-8">
          <div className="gold-ornament mb-2" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl" style={{ color: "var(--brand-primary)" }}>
            Find Your Ghee
          </h1>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center rounded-full border-2 liquid-glass pl-5 pr-2 py-1.5 shadow-md border-amber-900/15">
            <Search className="w-5 h-5 mr-2" style={{ color: "var(--brand-primary)" }} />
            <input
              data-testid={TESTIDS.searchInput}
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, size, or use (e.g. 500 ml, family, bulk)…"
              className="flex-1 bg-transparent outline-none py-2 text-base text-[color:var(--brand-text)] placeholder:text-stone-400"
              aria-label="Search products"
            />
          </div>
        </div>

        {results.length === 0 ? (
          <div data-testid={TESTIDS.searchEmpty} className="text-center py-12" style={{ color: "var(--brand-muted)" }}>
            No products match "{q}". Try another term.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {results.map((p, i) => (
              <ScrollReveal key={p.sku} staggerIndex={i} direction="up" distance={20}>
                <article
                  data-testid={TESTIDS.searchResult(p.sku)}
                  className="liquid-glass rounded-2xl border border-white/70 p-5 flex gap-4 items-center shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={p.image?.startsWith("/api") ? `http://localhost:8001${p.image}` : (p.image || "/assets/products/HG1000_front.png")}
                    alt={`${p.name} ${p.variant}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/assets/products/HG1000_front.png";
                    }}
                    className="w-24 h-28 object-contain bg-[color:var(--brand-cream)] rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--brand-secondary)" }}>{p.variant}</div>
                    <div className="text-lg font-bold" style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}>
                      {p.name}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--brand-muted)" }}>
                      Perfect for {p.idealFor}
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-price text-xl font-bold" style={{ color: "var(--brand-primary)" }}>{formatINR(p.price)}</span>
                      {p.mrp > p.price && <span className="font-price text-xs line-through" style={{ color: "var(--brand-muted)" }}>{formatINR(p.mrp)}</span>}
                    </div>
                    <div className="mt-3">
                      <SlideToCartButton
                        onAdd={() => add(p, 1)}
                        compact={true}
                        productName={p.name}
                        variant={p.variant}
                      />
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
