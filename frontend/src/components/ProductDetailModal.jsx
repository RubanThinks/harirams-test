import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Heart, 
  CheckCircle2, 
  Droplets, 
  Layers, 
  Clock, 
  Flame, 
  Check, 
  Info,
  ShoppingCart,
  Plus,
  Minus
} from "lucide-react";
import { formatINR } from "@/lib/format";

function getProductImages(product) {
  if (!product) return ["/assets/products/HG1000_front.png"];
  
  if (product.sku === "HG200" || product.variant?.includes("200")) {
    return [
      { url: "/assets/products/HG200_front.png", label: "Front View" },
      { url: "/assets/products/HG200_right.png", label: "Right Angle" },
      { url: "/assets/products/HG200_left.png", label: "Left Angle" },
    ];
  }
  if (product.sku === "HG500" || product.variant?.includes("500")) {
    return [
      { url: "/assets/products/HG500_front.png", label: "Front View" },
      { url: "/assets/products/HG500_right.png", label: "Right Angle" },
      { url: "/assets/products/HG500_left.png", label: "Left Angle" },
    ];
  }
  if (
    product.sku === "HG1000" || 
    product.variant?.includes("1000") || 
    product.variant?.toLowerCase()?.includes("1 litre") || 
    product.variant?.toLowerCase()?.includes("1l")
  ) {
    return [
      { url: "/assets/products/HG1000_front.png", label: "Front View" },
      { url: "/assets/products/HG1000_right.png", label: "Right Angle" },
      { url: "/assets/products/HG1000_left.png", label: "Left Angle" },
    ];
  }
  if (
    product.sku === "HG5000" || 
    product.variant?.includes("5000") || 
    product.variant?.toLowerCase()?.includes("5 litre") || 
    product.variant?.toLowerCase()?.includes("5l")
  ) {
    return [
      { url: "/assets/products/HG5000_front.png", label: "Front View" },
      { url: "/assets/products/HG5000_right.png", label: "Side Seal" },
      { url: "/assets/products/HG5000_left.png", label: "Handle View" },
    ];
  }

  if (product.angles && product.angles.length > 0) {
    return product.angles.map((u, i) => ({ url: u, label: `Angle ${i + 1}` }));
  }

  return [{ url: product.image || "/assets/products/HG1000_front.png", label: "Front View" }];
}

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "nutrition" | "usage"
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const images = getProductImages(product);
  const currentImg = images[selectedAngle] || images[0];

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl my-auto max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FFFDF8] border-2 border-[#D4AF37] p-5 sm:p-8 shadow-2xl text-stone-900"
        style={{
          boxShadow: "0 25px 60px -15px rgba(60, 36, 18, 0.45), inset 0 0 0 1px #F3E5C8",
          fontFamily: "'Poppins', Arial, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-700 transition-colors cursor-pointer z-10"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[#E8DCB8] text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E0] border border-[#D4AF37] text-xs font-bold uppercase tracking-widest text-[#8E1B1B] mb-2">
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Official Dairy Specification & Description</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2
                className="font-serif text-2xl sm:text-3xl font-bold text-stone-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {product.name} — {product.variant}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-amber-900/80 mt-0.5">
                Batch Verified • 100% Traditional Bilona Cow Ghee • FSSAI Certified
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-stone-950 font-price">
                {formatINR(product.price)}
              </div>
              {product.mrp > product.price && (
                <div className="text-xs text-stone-400 line-through font-price">
                  MRP {formatINR(product.mrp)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Visual Gallery (NEW High-Res PNGs with 3-Angle Switcher) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 py-5 items-center">
          
          {/* Main Visual Display (5 Cols) */}
          <div className="sm:col-span-5 flex flex-col items-center">
            <div className="relative w-full h-64 bg-gradient-to-b from-[#FAF4E6] to-[#FFFDF9] rounded-3xl border border-[#EBDCC7] flex items-center justify-center p-4 shadow-inner group">
              {/* Pack Variant Badge */}
              <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-[#8E1B1B] text-white text-xs font-bold shadow-xs">
                {product.variant} Pack
              </div>

              {/* Main Active Angle Image */}
              <img
                src={currentImg.url}
                alt={`${product.name} - ${currentImg.label}`}
                className="max-h-52 object-contain drop-shadow-xl transition-all duration-300 group-hover:scale-105"
              />

              <div className="absolute bottom-2.5 right-3 text-[10px] text-stone-400 font-medium">
                {currentImg.label}
              </div>
            </div>

            {/* Interactive Thumbnail Gallery Selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-3 w-full justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAngle(idx)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedAngle === idx
                        ? "bg-amber-100/80 border-amber-600 text-amber-950 shadow-xs ring-1 ring-amber-500/30"
                        : "bg-white border-[#EADFC7] text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-4 h-4 object-contain" />
                    <span>{img.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Product Specification Highlights (7 Cols) */}
          <div className="sm:col-span-7 space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EBDCC7] flex items-start gap-3 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-900">Beta-Prime Danedar Crystalline Matrix</div>
                <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Slow-cooled at an ambient curve of 0.5°C/hr. Yields soft, golden aromatic granules that melt instantly at human body temperature (36°C) on hot rice.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EBDCC7] flex items-start gap-3 shadow-2xs">
              <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-900">250°C (482°F) High Smoke Point</div>
                <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Superior thermal stability for traditional tempering, deep tadka, crispy roast dosais, and festive sweets without breakdown or free radical formation.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EBDCC7] flex items-start gap-3 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-900">Zero Additives • 100% Cultured Curd Butter</div>
                <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  No artificial diacetyl flavors, no coloring, no animal tallow, and no palm oil. Lactose and casein naturally precipitated and filtered out.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Detailed Specifications */}
        <div className="mt-2 border-t border-[#E8DCB8] pt-4">
          <div className="flex items-center gap-2 border-b border-[#E8DCB8] pb-2 mb-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#174C2B] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Description & Craft
            </button>
            <button
              onClick={() => setActiveTab("usage")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "usage"
                  ? "bg-[#174C2B] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Usage & Storage
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-3 text-xs text-stone-700 leading-relaxed animate-in fade-in duration-150">
              <p>
                <strong>Hariram’s Pure Cow Ghee</strong> is handcrafted following age-old South Indian dairy traditions. Fresh cow milk is naturally fermented into cultured curd, then churned with bi-directional wooden churns to harvest fresh makkhan, which is simmered in heavy-bottomed brass cauldrons over a controlled flame.
              </p>
              <p>
                Every jar captures the natural golden color, nutty toasted bouquet, and wholesome digestible fats celebrated in ancient Ayurvedic treatises as <em>“Sarva Sneha Uttamam”</em> (the supreme culinary lipid).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DCB8] text-center">
                  <div className="text-[10px] text-stone-500 uppercase">Shelf Life</div>
                  <div className="font-bold text-stone-900">12 Months</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DCB8] text-center">
                  <div className="text-[10px] text-stone-500 uppercase">Container</div>
                  <div className="font-bold text-stone-900">Glass Jar / Tin</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DCB8] text-center">
                  <div className="text-[10px] text-stone-500 uppercase">FSSAI Lic.</div>
                  <div className="font-bold text-stone-900">12425002002875</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DCB8] text-center">
                  <div className="text-[10px] text-stone-500 uppercase">Origin</div>
                  <div className="font-bold text-stone-900">Tamil Nadu, IN</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USAGE */}
          {activeTab === "usage" && (
            <div className="space-y-3 text-xs text-stone-700 leading-relaxed animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DCB8]">
                <strong className="text-stone-900 block mb-1">Morning & Afternoon Culinary Ritual:</strong>
                Mix 1–2 teaspoons over steaming hot paruppu saatham (dal rice) or drizzle on cast-iron roast dosais. The high heat unlocks deep golden aromas and promotes smooth carbohydrate digestion.
              </div>
              <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DCB8]">
                <strong className="text-stone-900 block mb-1">Evening Twilight & Sleep Bio-Hack:</strong>
                Stir 1 teaspoon into warm spiced golden milk (with Lakadong turmeric and nutmeg) 30 minutes before sleep to lubricate enteric mucosa, soothe Vata dosha, and support deep sleep.
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <strong className="text-amber-900 block mb-1">Important Storage Advisory:</strong>
                Store in a cool, dry pantry away from direct sunlight. <strong>Do NOT refrigerate</strong>, as fridge condensation compromises the delicate Danedar crystalline lattice. Always use a clean, dry spoon.
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Cart Action Bar */}
        <div className="pt-5 mt-4 border-t border-[#E8DCB8] flex items-center justify-between flex-wrap gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-600">Quantity:</span>
            <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-2xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-l-xl cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 text-center font-bold text-sm text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-r-xl cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs tracking-wider transition-all cursor-pointer"
            >
              Continue Browsing
            </button>

            <button
              onClick={handleAddToCart}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart • {formatINR(product.price * quantity)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
