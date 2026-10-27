import React, { useEffect, useState, useMemo } from "react";
import { 
  Crown, 
  ShieldCheck, 
  Package, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  PhoneCall, 
  MessageCircle, 
  SlidersHorizontal,
  Info,
  Flame,
  Award,
  Layers,
  Check,
  ChevronRight,
  ShoppingCart,
  Eye,
  BookOpen
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { useConfig } from "@/hooks/useConfig";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProductDetailModal from "@/components/ProductDetailModal";
import { TESTIDS } from "@/constants/testIds";

const PACK_USAGE_MATRIX = [
  {
    sku: "HG200",
    variant: "200 ml",
    tagline: "Trial & Sacred Deepam",
    bestFor: "Individual usage, hostel students, infant's first dal rice, and daily home vilakku pooja.",
    burnRate: "1 teaspoon / day",
    shelfEstimate: "~30 to 45 Days",
    container: "Aesthetic Food-Grade Glass Jar",
    badge: "Trial Pack",
  },
  {
    sku: "HG500",
    variant: "500 ml",
    tagline: "The Everyday Family Jar",
    bestFor: "Couples and small families (2–3 members) for daily morning coffee, evening tempering, and paruppu saatham.",
    burnRate: "1–2 tablespoons / day",
    shelfEstimate: "~25 to 35 Days",
    container: "Wide-Mouth Heavy Glass Jar",
    badge: "Popular Value",
  },
  {
    sku: "HG1000",
    variant: "1 Litre",
    tagline: "South Indian Kitchen Pillar",
    bestFor: "Full households (4–5 members), avid home cooks, crispy roast dosais, and festive weekend sweets.",
    burnRate: "2–3 tablespoons / day",
    shelfEstimate: "~35 to 50 Days",
    container: "Royal Heavy-Gauge Glass Jar",
    badge: "Bestseller",
    highlight: true,
  },
  {
    sku: "HG5000",
    variant: "5 Litre",
    tagline: "Temple Trusts & Celebrations",
    bestFor: "Temple poojas, wedding homams (Laja Homa), Grihapravesam, catering, and joint family pantries.",
    burnRate: "Bulk & Ritual Serving",
    shelfEstimate: "Airtight Sealed Freshness (12 Months)",
    container: "Heavy-Gauge Hermetically Sealed Tin",
    badge: "Maximum Savings",
  },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "family" | "bulk" | "trial"
  const [sortBy, setSortBy] = useState("featured"); // "featured" | "price_asc" | "price_desc" | "savings"
  const [activeAngles, setActiveAngles] = useState({}); // { [sku]: angleIndex }
  const [modalProduct, setModalProduct] = useState(null);

  const { add } = useCart();
  const { data: seoConfig } = useConfig("seo");
  const { data: company } = useConfig("company");

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/products")
      .then((r) => {
        if (!alive) return;
        setProducts(r.data?.products || []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  // SEO dynamic meta tags & Schema.org Product List
  useEffect(() => {
    const pageSeo = seoConfig?.shop || {
      title: "Shop Pure Cow Ghee — Traditional Vedic A2 Collection | Hariram's",
      description: "Buy 100% authentic Danedar pure cow ghee online. Available in 200ml, 500ml, 1L and 5L packs with tamper-evident safe transit delivery.",
    };
    document.title = pageSeo.title;
    setMeta("description", pageSeo.description);
    setLink("canonical", pageSeo.canonical || window.location.href);
    setMeta("og:title", pageSeo.title, "property");
    setMeta("og:description", pageSeo.description, "property");

    if (products && products.length > 0) {
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Hariram's Pure Cow Ghee Collection",
        "itemListElement": products.map((prod, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "item": {
            "@type": "Product",
            "name": `Hariram's Pure Cow Ghee — ${prod.variant}`,
            "image": `https://www.harirams.in${prod.image || '/assets/products/HG1000_front.png'}`,
            "description": `100% authentic pure cow ghee crafted via traditional Vedic Bilona method with natural Danedar granules. Pack size: ${prod.variant}.`,
            "sku": prod.sku,
            "brand": {
              "@type": "Brand",
              "name": "HARIRAM'S"
            },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": prod.price,
              "priceValidUntil": "2027-12-31",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": prod.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "url": "https://www.harirams.in/shop"
            }
          }
        }))
      };

      let script = document.getElementById("shop-products-schema");
      if (!script) {
        script = document.createElement("script");
        script.id = "shop-products-schema";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(productSchema);
    }

    return () => {
      const s = document.getElementById("shop-products-schema");
      if (s) s.remove();
    };
  }, [seoConfig, products]);

  // Filtered and sorted products
  const displayProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (filter === "family") {
      list = list.filter((p) => p.sku === "HG500" || p.sku === "HG1000");
    } else if (filter === "bulk") {
      list = list.filter((p) => p.sku === "HG5000");
    } else if (filter === "trial") {
      list = list.filter((p) => p.sku === "HG200");
    }

    // Sort order
    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "savings") {
      list.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
    } else {
      // Default featured
      list.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    }

    return list;
  }, [products, filter, sortBy]);

  const setAngle = (sku, idx) => {
    setActiveAngles((prev) => ({ ...prev, [sku]: idx }));
  };

  const getProductImage = (product) => {
    const currentAngle = activeAngles[product.sku] || 0;
    const angles = product.angles || (product.images ? product.images.map(img => img.url) : []);
    if (angles && angles.length > currentAngle) {
      return angles[currentAngle];
    }
    return product.image || "/assets/products/HG1000_front.png";
  };

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} className="py-6 lg:py-12">
      <div className="container-brand max-w-6xl mx-auto px-4 sm:px-6">

        {/* SHOP HEADER — CLEAN TYPOGRAPHY (NO HERO CAROUSEL) */}
        <ScrollReveal direction="up" distance={15}>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-800/15 mb-3 text-xs uppercase tracking-widest font-semibold text-amber-900" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Direct From Our Vedic Dairy</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-3"
              style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The Pure Cow Ghee Collection
            </h1>

            <p
              className="text-stone-600 text-sm sm:text-base leading-relaxed"
              style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
            >
              Freshly clarified from cultured curd butter over a slow traditional flame. 
              Available in pure glass jars & heavy-gauge tins with guaranteed safe doorstep transit across India.
            </p>

            {/* Quick Purity Strip */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 text-xs text-stone-600" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Danedar Texture
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero Chemical Preservatives
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24h Shockproof Dispatch
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> FSSAI Certified: 12425002002875
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* FILTER & SORT CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-white border border-[#EADFC7] shadow-xs mb-8" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
            {[
              { id: "all", label: "All Packs (4)" },
              { id: "family", label: "Family Kitchen (500ml & 1L)" },
              { id: "bulk", label: "Temple & Bulk (5L Tin)" },
              { id: "trial", label: "Trial & Pooja (200ml)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#174C2B] text-white shadow-xs"
                    : "text-stone-700 hover:bg-amber-50 hover:text-stone-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-stone-600 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-amber-900/15 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 outline-none focus:border-amber-600 cursor-pointer"
            >
              <option value="featured">Featured Packs</option>
              <option value="savings">Biggest Savings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID SHOWCASE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[460px] rounded-3xl bg-white/70 border border-amber-900/10 animate-pulse"
              />
            ))}

          {!loading &&
            displayProducts.map((p, i) => {
              const savings = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
              const angles = p.angles || [p.image];
              const activeIdx = activeAngles[p.sku] || 0;

              return (
                <ScrollReveal key={p.sku} staggerIndex={i} direction="up" distance={20} className="h-full flex flex-col">
                  <div className="relative rounded-3xl bg-white border-1.5 border-[#EBE4D8] hover:border-amber-600/60 p-5 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 group h-full">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8E1B1B] text-white text-[11px] font-bold tracking-wide">
                        {p.variant}
                      </span>
                      {p.bestSeller ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                          <Crown className="w-3 h-3 text-amber-200" /> BESTSELLER
                        </span>
                      ) : savings > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold">
                          SAVE {savings}%
                        </span>
                      ) : null}
                    </div>

                    {/* Product Image Stage with Dedicated Angles */}
                    <div className="relative w-full h-52 bg-[#FAF8F5] rounded-2xl flex items-center justify-center p-3 mb-4 group-hover:bg-[#F8F4EC] transition-colors">
                      <img
                        src={getProductImage(p)}
                        alt={`${p.name} - ${p.variant}`}
                        className="max-h-44 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Multi-angle view switcher */}
                      {angles.length > 1 && (
                        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {angles.map((_, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAngle(p.sku, aIdx);
                              }}
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                activeIdx === aIdx ? "bg-amber-600 w-5" : "bg-stone-300 hover:bg-stone-400"
                              }`}
                              title={`View angle ${aIdx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Meta */}
                    <div className="text-center mb-3">
                      <h3
                        className="font-serif font-bold text-lg text-stone-900 tracking-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {p.name}
                      </h3>
                      <div className="text-xs text-amber-900/80 font-medium mt-0.5" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                        {p.idealFor || "Traditional Cow Ghee"}
                      </div>
                    </div>

                    {/* Pricing Block */}
                    <div className="py-2.5 px-3 rounded-xl bg-[#FFFDF9] border border-[#EADFC7]/80 text-center mb-4" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-xl font-bold text-stone-900 font-price">
                          {formatINR(p.price)}
                        </span>
                        {p.mrp > p.price && (
                          <span className="text-xs text-stone-400 line-through font-price">
                            {formatINR(p.mrp)}
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-emerald-700 font-medium mt-0.5">
                        Taxes included • Doorstep delivery
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                      <button
                        onClick={() => add(p, 1)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add To Cart</span>
                      </button>

                      <button
                        onClick={() => setModalProduct(p)}
                        className="w-full py-2 text-center text-xs font-semibold text-stone-700 hover:text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl border border-amber-900/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>View Description & Details</span>
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
        </div>

        {/* UNIQUE SECTION 1: WHICH PACK FITS YOUR HOME? (ARCHITECTURAL SELECTOR) */}
        <ScrollReveal direction="up" distance={20} className="mb-16">
          <section className="rounded-3xl p-6 sm:p-10 border shadow-xs bg-white" style={{ borderColor: "var(--brand-border)" }}>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="gold-ornament mb-2" />
              <h2
                className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
              >
                Which Pack Fits Your Kitchen?
              </h2>
              <p className="text-xs sm:text-sm text-stone-600" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                A quick architectural reference guide to choose the ideal pack size for your home's culinary rhythm.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              {PACK_USAGE_MATRIX.map((item) => (
                <div
                  key={item.sku}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.highlight
                      ? "bg-gradient-to-b from-amber-50/80 to-white border-amber-600/40 shadow-xs ring-1 ring-amber-600/20"
                      : "bg-[#FFFDF9] border-[#EADFC7]/80 hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-lg text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {item.variant}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {item.badge}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-amber-800 mb-2">{item.tagline}</div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">{item.bestFor}</p>

                  <div className="border-t border-amber-900/10 pt-3 space-y-1.5 text-[11px] text-stone-500">
                    <div><strong className="text-stone-700">Usage Rate:</strong> {item.burnRate}</div>
                    <div><strong className="text-stone-700">Est. Duration:</strong> {item.shelfEstimate}</div>
                    <div><strong className="text-stone-700">Container:</strong> {item.container}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* UNIQUE SECTION 2: TEMPLE TRUSTS, WEDDINGS & WHOLESALE B2B CONCIERGE */}
        <ScrollReveal direction="up" distance={20} className="mb-16">
          <div
            className="rounded-3xl p-8 sm:p-10 border shadow-md relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #174C2B 0%, #0F3620 100%)",
              borderColor: "#123D22",
              fontFamily: "'Poppins', Arial, sans-serif",
            }}
          >
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-white">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold uppercase tracking-widest mb-3">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Wholesale, Temple & Gifting Concierge</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Bulk Orders for Temples, Poojas & Corporate Celebrations
                </h3>

                <p className="text-amber-100/80 text-sm leading-relaxed mb-4 max-w-2xl">
                  Planning an auspicious Grihapravesam, temple Navaratri Deepam festival, or corporate festive hampers? 
                  We supply ritual-grade cow ghee in 5L hermetically-sealed containers and custom gift boxes with verified batch lab reports.
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-amber-200/90 font-medium">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-amber-400" /> Temple Trust Invoicing (GST Input)</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-amber-400" /> Certified Free From Additives</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-amber-400" /> Doorstep Transport Guarantees</span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <a
                  href={`https://wa.me/919500021456?text=${encodeURIComponent("Hello Hariram's, I would like to inquire about bulk/temple pure cow ghee orders.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>

                <a
                  href="tel:+919500021456"
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-amber-300" />
                  <span>Call: +91 95000 21456</span>
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* UNIQUE SECTION 3: TRANSIT SAFETY GUARANTEE (SHOCKPROOF PACKAGING) */}
        <ScrollReveal direction="up" distance={15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
            <div className="p-6 rounded-2xl bg-white border border-[#EADFC7] shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-amber-800">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                3-Layer Shockproof Armor
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Custom air-cushioned sleeves and drop-tested double-wall outer boxes safeguard your glass jars from shock during transit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EADFC7] shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Zero-Breakage Guarantee
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                In the rare case of transit damage or seal defect, we provide a 100% immediate replacement or full refund with zero questions asked.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EADFC7] shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-amber-800">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                24-Hour Express Dispatch
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                All online orders are packed fresh from the latest clarifying batch and handed over to premier couriers within 24 business hours.
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={(p, qty = 1) => {
            add(p, qty);
            setModalProduct(null);
          }}
        />
      )}
    </div>
  );
}

// Helpers for SEO meta
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
