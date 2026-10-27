import React, { useEffect, useRef, useState } from "react";
import { Crown, HandHeart, Users, Utensils, Building2, ShoppingCart, Check } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";
import ScrollReveal from "@/components/ui/ScrollReveal";

const IDEAL_ICONS = [HandHeart, Users, Utensils, Building2];
const HOVER_CYCLE_MS = 1400;

function getGallery(product) {
  // Dedicated 3-angle photography for 200 ml pack (1. Front, 2. Right, 3. Back)
  if (
    product?.sku === "HG200" ||
    product?.variant?.includes("200")
  ) {
    return [
      "/assets/products/HG200_front.png",
      "/assets/products/HG200_right.png",
      "/assets/products/HG200_left.png"
    ];
  }

  // Dedicated 3-angle photography for 500 ml pack (1. Front, 2. Right, 3. Back)
  if (
    product?.sku === "HG500" ||
    product?.variant?.includes("500")
  ) {
    return [
      "/assets/products/HG500_front.png",
      "/assets/products/HG500_right.png",
      "/assets/products/HG500_left.png"
    ];
  }

  // Dedicated 3-angle photography for 1 Litre / 1000 ml pack (1. Front, 2. Right, 3. Back)
  if (
    product?.sku === "HG1000" ||
    product?.variant?.includes("1000") ||
    product?.variant?.toLowerCase()?.includes("1 litre") ||
    product?.variant?.toLowerCase()?.includes("1l")
  ) {
    return [
      "/assets/products/HG1000_front.png",
      "/assets/products/HG1000_right.png",
      "/assets/products/HG1000_left.png"
    ];
  }

  // Dedicated 3-angle photography for 5 Litre pack (1. Front, 2. Right, 3. Back)
  if (
    product?.sku === "HG5000" ||
    product?.variant?.includes("5000") ||
    product?.variant?.toLowerCase()?.includes("5 litre") ||
    product?.variant?.toLowerCase()?.includes("5l")
  ) {
    return [
      "/assets/products/HG5000_front.png",
      "/assets/products/HG5000_right.png",
      "/assets/products/HG5000_left.png"
    ];
  }

  // If explicit angles are provided for other products
  if (Array.isArray(product?.angles) && product.angles.length > 1) {
    return product.angles;
  }

  if (product?.transparentImage) {
    return [product.transparentImage];
  }
  return ["/assets/products/HG1000_front.png"];
}

function ProductImage({ product }) {
  const gallery = getGallery(product);
  const hasAlternates = gallery.length > 1;
  const [activeIdx, setActiveIdx] = useState(0);
  const stageRef = useRef(null);

  // Smooth mouse scrubbing for interactive rotating feel (1. Front -> 2. Right -> 3. Back)
  const handleMouseMove = (e) => {
    if (!hasAlternates || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));

    const idx = Math.min(gallery.length - 1, Math.floor(ratio * gallery.length));
    setActiveIdx(idx);
  };

  return (
    <div
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveIdx(0)}
      className="relative w-full h-full flex flex-col items-center justify-center cursor-ew-resize select-none"
      data-testid={`product-image-${product.sku}`}
      data-hover-alternates={hasAlternates ? "true" : "false"}
    >
      {/* 3-Angle Bottle Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        {gallery.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`${product.name} — ${product.variant} pack view ${i + 1}`}
            loading={i === 0 ? "lazy" : "eager"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/assets/products/HG1000_front.png";
            }}
            data-testid={`product-image-${product.sku}-${i}`}
            className={`bottle-img absolute inset-0 mx-auto my-auto max-h-44 sm:max-h-48 w-auto max-w-full object-contain transition-all duration-200 drop-shadow-md group-hover:scale-105 ${
              i === activeIdx ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
          />
        ))}
      </div>

      {/* Angle Selector Dots (Clean luxury indicators, no text labels) */}
      {hasAlternates && (
        <div className="absolute bottom-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-stone-200/80 shadow-2xs">
          {gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(i);
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setActiveIdx(i);
              }}
              className={`transition-all duration-200 rounded-full flex items-center justify-center cursor-pointer ${
                i === activeIdx
                  ? "w-4 h-1.5 bg-[#8E1B1B]"
                  : "w-1.5 h-1.5 bg-stone-300 hover:bg-stone-500"
              }`}
              aria-label={`Show view ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TactileAddToCartButton({ onAdd, disabled, testId }) {
  const [added, setAdded] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || added) return;
    onAdd();
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={handleClick}
      className={`tactile-press-btn ${added ? "is-success" : ""}`}
      aria-label="Add to cart"
    >
      {added ? (
        <>
          <Check className="w-4 h-4 stroke-[3] text-white" />
          <span>Added to Cart</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
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
      className="w-full py-10 lg:py-16 scroll-mt-24"
      style={{ background: "var(--brand-cream)" }}
      aria-label="Choose your pack"
    >
      <div className="container-brand">
        <ScrollReveal direction="up" distance={20}>
          <div className="text-center mb-10 lg:mb-12">
            <div className="flex items-center justify-center mb-2.5">
              <span className="gold-ornament" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif" style={{ color: "var(--brand-primary)" }}>
              Choose Your Pack
            </h2>
            <p className="mt-2 text-sm lg:text-base font-medium" style={{ color: "var(--brand-text)" }}>
              <span style={{ color: "var(--brand-secondary)" }}>❋</span> Freshly prepared
              &nbsp;•&nbsp; Pure Cow Ghee &nbsp;•&nbsp; Delivered with care{" "}
              <span style={{ color: "var(--brand-secondary)" }}>❋</span>
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="luxury-product-card animate-pulse h-[460px]"
                aria-hidden
              />
            ))}

          {!loading &&
            products.map((p, i) => {
              const Icon = IDEAL_ICONS[i % IDEAL_ICONS.length];
              return (
                <ScrollReveal key={p.sku} staggerIndex={i} direction="up" distance={25} className="h-full flex flex-col">
                  <article
                    data-testid={TESTIDS.productCard(p.sku)}
                    className="product-card luxury-product-card group h-full"
                  >
                    {/* Clean Product Stage */}
                    <div className="product-image-stage">
                      {/* Pack Size Badge */}
                      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-[#8E1B1B] text-white border border-white/60 font-bold text-xs tracking-wide shadow-xs">
                        {p.variant}
                      </div>

                      {/* Bestseller Badge */}
                      {p.bestSeller && (
                        <div
                          data-testid={TESTIDS.productBestSeller(p.sku)}
                          className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold text-[10.5px] tracking-wider uppercase shadow-xs flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3 text-amber-200" />
                          <span>BESTSELLER</span>
                        </div>
                      )}

                      {/* Product Image */}
                      <ProductImage product={p} />
                    </div>

                    {/* Title & Authentic Subtitle */}
                    <div className="w-full text-center px-1 mb-2">
                      <h3 className="font-serif font-bold text-lg text-stone-900 tracking-tight leading-snug">
                        {p.name}
                      </h3>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-900/70 mt-0.5">
                        100% Traditional Cow Ghee
                      </div>
                    </div>

                    {/* Purpose Heritage Chip */}
                    <div className="flex items-center gap-2.5 mb-3 w-full px-3 py-1.5 rounded-xl bg-[#FAF6EE] border border-[#EBE0CC]">
                      <span
                        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[#DFCBB0] text-[#B45309] shadow-2xs"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="text-left min-w-0">
                        <div className="text-[9.5px] uppercase tracking-wider font-bold text-amber-900/70">
                          Perfect for
                        </div>
                        <div className="text-xs font-semibold text-stone-800 truncate">
                          {p.idealFor || p.description}
                        </div>
                      </div>
                    </div>

                    {/* Pricing (Google Pay / Amazon Style) */}
                    <div className="mb-4 flex items-baseline justify-center gap-2 flex-wrap">
                      <span
                        data-price={p.price}
                        className="font-price text-2xl lg:text-3xl font-bold tracking-tight text-emerald-950"
                      >
                        {formatINR(p.price)}
                      </span>
                      {p.mrp > p.price ? (
                        <>
                          <span className="font-price line-through text-sm font-medium text-stone-400">
                            {formatINR(p.mrp)}
                          </span>
                          <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                            Save {Math.round(((p.mrp - p.price) / p.mrp) * 100)}%
                          </span>
                        </>
                      ) : null}
                    </div>

                    {/* Amazon / Flipkart Style Tactile Press Add to Cart Button */}
                    <div className="w-full mt-auto">
                      <TactileAddToCartButton
                        testId={TESTIDS.productAdd(p.sku)}
                        onAdd={() => add(p, 1)}
                        disabled={!p.available}
                      />
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
        </div>
      </div>
    </section>
  );
}
