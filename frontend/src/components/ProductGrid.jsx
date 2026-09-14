import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart, Star, HandHeart, Users, Utensils, Building2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";

const IDEAL_ICONS = [HandHeart, Users, Utensils, Building2];
const HOVER_CYCLE_MS = 1400;

function PackBadge({ variant }) {
  const isFiveLitre = /5\s*L/i.test(variant);
  return (
    <div className={`pack-badge ${isFiveLitre ? "blue" : ""}`}>
      {variant}
    </div>
  );
}

/**
 * Builds an ordered list of image URLs for a product with the main image first.
 * Falls back to the legacy singular `image` field if `images[]` is empty.
 */
function getGallery(product) {
  const list = Array.isArray(product.images) ? product.images.filter((i) => i?.url) : [];
  if (list.length === 0) {
    return product.image ? [product.image] : [];
  }
  const main = list.find((i) => i.isMain) || list[0];
  const others = list.filter((i) => i.url !== main.url);
  return [main.url, ...others.map((i) => i.url)];
}

function ProductImage({ product }) {
  const gallery = getGallery(product);
  const hasAlternates = gallery.length > 1;
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCycle = () => {
    if (!hasAlternates) return;
    // Start from the first non-main image on hover
    setActiveIdx(1);
    if (gallery.length > 2) {
      timerRef.current = setInterval(() => {
        setActiveIdx((cur) => {
          const next = cur + 1;
          return next >= gallery.length ? 1 : next;
        });
      }, HOVER_CYCLE_MS);
    }
  };

  const stopCycle = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setActiveIdx(0);
  };

  return (
    <div
      className="relative w-full flex-1 flex items-center justify-center py-3 lg:py-4"
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
      onFocus={startCycle}
      onBlur={stopCycle}
      data-testid={`product-image-${product.sku}`}
      data-hover-alternates={hasAlternates ? "true" : "false"}
    >
      {gallery.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${product.name} — ${product.variant} pack${i > 0 ? ` (view ${i + 1})` : ""}`}
          loading={i === 0 ? "lazy" : "eager"}
          data-testid={`product-image-${product.sku}-${i}`}
          className={`bottle-img absolute inset-0 mx-auto my-auto w-32 lg:w-40 h-40 lg:h-52 object-contain drop-shadow-md transition-opacity duration-500 ${
            i === activeIdx ? "opacity-100" : "opacity-0"
          }`}
          style={{ position: i === 0 ? "relative" : "absolute" }}
        />
      ))}
      {hasAlternates && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
             data-testid={`product-image-dots-${product.sku}`}>
          {gallery.map((_, i) => (
            <span
              key={i}
              className="block h-1.5 rounded-full transition-all"
              style={{
                width: i === activeIdx ? 14 : 6,
                background: i === activeIdx
                  ? "var(--brand-primary)"
                  : "rgba(59, 36, 20, 0.28)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/products")
      .then((r) => alive && setProducts(r.data.products || []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <section
      id="products"
      data-testid={TESTIDS.productsSection}
      className="w-full py-4 lg:py-8 scroll-mt-24"
      style={{ background: "var(--brand-cream)" }}
      aria-label="Choose your pack"
    >
      <div className="container-brand">
        <div className="text-center mb-4 lg:mb-6">
          <div className="flex items-center justify-center mb-2">
            <span className="gold-ornament" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl" style={{ color: "var(--brand-primary)" }}>
            Choose Your Pack
          </h2>
          <p className="mt-2 text-sm lg:text-base" style={{ color: "var(--brand-text)" }}>
            <span style={{ color: "var(--brand-secondary)" }}>❋</span> Freshly prepared
            &nbsp;•&nbsp; Pure Cow Ghee &nbsp;•&nbsp; Delivered with care{" "}
            <span style={{ color: "var(--brand-secondary)" }}>❋</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="product-card animate-pulse h-[540px]"
                aria-hidden
              />
            ))}

          {!loading &&
            products.map((p, i) => {
              const Icon = IDEAL_ICONS[i % IDEAL_ICONS.length];
              return (
                <article
                  key={p.sku}
                  data-testid={TESTIDS.productCard(p.sku)}
                  className="product-card fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {p.bestSeller && (
                    <div
                      data-testid={TESTIDS.productBestSeller(p.sku)}
                      className="bestseller-ribbon"
                    >
                      <Star className="w-3.5 h-3.5" fill="white" /> BESTSELLER
                    </div>
                  )}
                  <PackBadge variant={p.variant} index={i} />

                  <ProductImage product={p} />

                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                      style={{
                        border: "1.5px solid var(--brand-secondary)",
                        background: "var(--brand-cream)",
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "var(--brand-secondary)" }} />
                    </span>
                    <div className="text-left">
                      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--brand-muted)" }}>
                        Perfect for
                      </div>
                      <div className="text-sm font-semibold" style={{ color: "var(--brand-text)" }}>
                        {p.idealFor || p.description}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-center gap-2">
                    <span className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}>
                      {formatINR(p.price)}
                    </span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="line-through text-sm" style={{ color: "var(--brand-muted)" }}>
                        {formatINR(p.mrp)}
                      </span>
                    )}
                  </div>

                  <button
                    data-testid={TESTIDS.productAdd(p.sku)}
                    onClick={() => add(p, 1)}
                    disabled={!p.available}
                    className="btn-primary w-full mt-5"
                    aria-label={`Add ${p.variant} ${p.name} to cart`}
                  >
                    <ShoppingCart className="w-5 h-5" /> ADD TO CART
                  </button>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
}
