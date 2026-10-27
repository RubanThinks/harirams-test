import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  HelpCircle,
  Sparkles,
  Search,
  X,
  Droplets,
  Flame,
  Heart,
  ShieldCheck,
  PackageCheck,
  Sun,
  Moon,
  AlertCircle,
  PhoneCall,
  MessageCircle,
  Mail,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Eye,
  SlidersHorizontal,
  Compass
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useConfig } from "@/hooks/useConfig";

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "purity", label: "Purity & Bilona Craft" },
  { id: "health", label: "Health & Nutrition" },
  { id: "culinary", label: "Cooking & Temple Pooja" },
  { id: "storage", label: "Storage & Packaging" },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "purity",
    badge: "Vedic Craft",
    q: "What makes Hariram’s Pure Cow Ghee fundamentally different from industrial butter oils?",
    summary:
      "Unlike factory butter oils made from high-speed centrifugal cream separators, Hariram’s follows the traditional Vedic Bilona method using cultured whole curd and slow brass simmer.",
    highlights: [
      {
        title: "Cultured Whole Curd Base",
        desc: "We start from wholesome cow milk naturally cultured overnight into active dahi, not raw residual factory cream.",
      },
      {
        title: "Bi-Directional Wooden Bilona Churning",
        desc: "Slow clockwise and counter-clockwise wooden rotation preserves delicate short and medium-chain fatty acids (Butyric and Lauric acids).",
      },
      {
        title: "Slow Brass Clarification (108°C – 112°C)",
        desc: "Simmered slowly in heavy-bottomed cauldrons over a gentle flame, letting milk solids caramelize into natural golden antioxidants.",
      },
      {
        title: "100% Pure & Additive-Free",
        desc: "Zero palm oil, zero animal tallow, zero synthetic diacetyl aromas, and zero chemical preservatives.",
      },
    ],
    callout: {
      type: "purity",
      label: "Purity Benchmark",
      text: "Every batch is verified 100% additive-free with an intact fatty-acid profile and zero synthetic trans-fats.",
    },
    tags: ["Cultured Curd", "Bi-Directional Bilona", "100% Additive-Free"],
  },
  {
    id: 2,
    category: "purity",
    badge: "Texture & Quality",
    q: "Why does Hariram’s Ghee have a granular (Danedar) crystalline texture?",
    summary:
      "Granular (Danedar) texture is the hallmark of authentic, naturally cooled pure cow ghee. Golden micro-granules settle naturally without artificial processing.",
    highlights: [
      {
        title: "Natural Slow Room-Temperature Settling",
        desc: "Unlike commercial oils that are blast-chilled into a flat paste, Hariram’s cools naturally, allowing wholesome golden granules to form effortlessly.",
      },
      {
        title: "Zero Industrial Additives or Stabilizers",
        desc: "Commercial operations often use artificial emulsifiers or palm fats. Hariram’s is 100% pure cow ghee with natural graininess.",
      },
    ],
    callout: {
      type: "tactile",
      label: "The Danedar Experience",
      text: "Place a small spoonful of Hariram’s on hot Ponni rice or a warm dosai. The golden grains melt smoothly with a rich, comforting aroma.",
    },
    tags: ["Danedar Texture", "Pure Cow Ghee", "Authentic Aroma"],
  },
  {
    id: 3,
    category: "health",
    badge: "Ayurvedic Heritage",
    q: "What do ancient Vedic scriptures and Ayurvedic texts state about cow ghee?",
    summary:
      "Classical Indian tradition honors pure cow ghee (Ghrita) not merely as a cooking medium, but as a nourishing, life-enhancing food and sacred blessing for the home.",
    highlights: [
      {
        title: "Charaka Samhita ('Sarva Sneha Uttamam')",
        desc: "Revered as the foremost of all wholesome culinary fats. It kindles gentle digestion, supports memory and intellect (Medhya), and nourishes bodily vitality (Ojas).",
      },
      {
        title: "Rigveda & Sacred Traditions",
        desc: "Celebrates Ghrita as the purest golden essence of life, offered in auspicious pooja lamps and sacred rituals for health and enduring prosperity.",
      },
      {
        title: "Cherished Family Milestones (Samskaras)",
        desc: "From infant blessings to Annaprashana (baby’s first dal rice) and wedding celebrations, pure cow ghee unites family occasions across generations.",
      },
    ],
    callout: {
      type: "shastra",
      label: "Classical Wisdom Translation",
      text: "'Ghee is the foremost among all wholesome fats—naturally cooling, kindling digestion, nourishing the intellect, and building enduring vitality.' — Charaka Samhita",
    },
    tags: ["Charaka Samhita", "Family Vitality", "Sacred Traditions"],
  },
  {
    id: 4,
    category: "health",
    badge: "Evening Wellness",
    q: "Why is it especially beneficial to consume Hariram's Ghee in the evening?",
    summary:
      "After a busy day, pure cow ghee provides soothing comfort to the stomach, natural healthy fats, and peaceful relaxation before sleep.",
    highlights: [
      {
        title: "1. Soothes the Digestive Lining",
        desc: "A warm spoonful of ghee helps calm gastric acidity and coats the digestive tract for comfortable overnight digestion.",
      },
      {
        title: "2. Nourishing Healthy Fats",
        desc: "Rich in beneficial short-chain fatty acids (including butyric acid) that provide gentle nourishment while your body rests.",
      },
      {
        title: "3. Promotes Peaceful, Restful Sleep",
        desc: "Warm milk with a spoonful of pure cow ghee is a time-tested bedtime tradition that relaxes the body and eases everyday tiredness.",
      },
    ],
    callout: {
      type: "ritual",
      label: "Evening Bedtime Ritual",
      text: "Enjoy 1 cup warm milk + a pinch of pure turmeric + crushed cardamom + 1 tsp of warm Hariram's Pure Cow Ghee 30 minutes before sleep.",
    },
    tags: ["Evening Comfort", "Digestive Health", "Restful Sleep"],
  },
  {
    id: 5,
    category: "health",
    badge: "Digestive Wellness",
    q: "Can individuals with lactose intolerance or casein sensitivities consume Hariram’s Ghee?",
    summary:
      "Yes, the vast majority of individuals with dairy sensitivities safely enjoy Hariram’s Ghee because milk solids and sugars are completely removed during slow clarification.",
    highlights: [
      {
        title: "Naturally Free of Lactose & Casein",
        desc: "During slow simmering, water evaporates and milk proteins (casein) and milk sugars (lactose) caramelize and settle to the bottom as golden brown residue.",
      },
      {
        title: "Micro-Clarified Liquid Gold",
        desc: "The golden fat is meticulously strained, leaving an ultra-pure lipid (>99.8% pure milk fat) that is exceptionally gentle on lactose-sensitive stomachs.",
      },
    ],
    callout: {
      type: "benefit",
      label: "Safe For Sensitive Stomachs",
      text: "Lab tests consistently confirm virtually undetectable lactose and casein levels, making it ideal for low-FODMAP and sensitive diets.",
    },
    tags: ["Lactose-Free", "Casein-Free", "Easy Digestion"],
  },
  {
    id: 6,
    category: "health",
    badge: "Family & Elders",
    q: "Is Hariram’s Ghee safe and recommended for infants, toddlers, and elders?",
    summary:
      "Absolutely. Pure cow ghee has been South India’s most trusted first baby fat for generations and a daily rejuvenator for aging joints.",
    highlights: [
      {
        title: "Infants & Toddlers (From 6 Months)",
        desc: "Half a teaspoon mixed with baby’s warm paruppu saatham (mashed dal rice) supplies essential fatty acids, fat-soluble vitamins (A, D, E, K), and natural DHA for brain development.",
      },
      {
        title: "Elders & Senior Family Members",
        desc: "Nourishes joint synovial fluid, relieves internal gastrointestinal dryness, and supports cognitive sharpness and memory retention (Smriti).",
      },
    ],
    callout: {
      type: "tradition",
      label: "The Annaprashana Milestone",
      text: "Mothers across Tamil Nadu and South India traditionally bless baby’s first solid meal with a golden dollop of cow ghee for strong digestion and vitality.",
    },
    tags: ["Baby Food Safe", "Joint Lubrication", "Annaprashana"],
  },
  {
    id: 7,
    category: "culinary",
    badge: "Culinary Science",
    q: "What is the smoke point of Hariram’s Ghee, and why is it superior for Indian cooking?",
    summary:
      "Hariram’s Pure Cow Ghee boasts a remarkably high smoke point of 250°C (482°F), significantly surpassing butter and refined vegetable oils.",
    highlights: [
      {
        title: "Thermal Stability at 250°C",
        desc: "Butter smokes at 175°C and cold-pressed oils break down rapidly under high heat. Hariram’s remains chemically stable without burning or creating toxic acrolein.",
      },
      {
        title: "Perfect for Roasts & Tadka",
        desc: "Creates crispy, golden Mylapore dosai roasts and locks aromatic essential oils into mustard seeds and curry leaves during high-temperature tempering.",
      },
    ],
    callout: {
      type: "culinary",
      label: "High-Heat Cooking Champion",
      text: "Zero trans-fats, zero oxidation under flame, and pure aromatic blooming of whole spices.",
    },
    tags: ["250°C Smoke Point", "No Acrolein", "Crispy Dosai Tadka"],
  },
  {
    id: 8,
    category: "culinary",
    badge: "Sacred Pooja & Temples",
    q: "Can Hariram’s Ghee be used for daily temple pooja, Agnihotra, and sacred Deepams?",
    summary:
      "Yes. Hariram’s Pure Cow Ghee is 100% sacred, sattvic, and unadulterated, trusted by family shrines, temple priests, and spiritual centers.",
    highlights: [
      {
        title: "Zero Black Soot & Clean Flame",
        desc: "Free from synthetic waxes or paraffin blends. Deepam wicks burn steadily with a bright, tranquil golden flame and zero black residue on brass lamps.",
      },
      {
        title: "Pure Honeyed Herbal Aroma",
        desc: "Releases a peaceful, authentic aroma that purifies home air and invites sattvic peace during morning and evening sandhya prayers.",
      },
    ],
    callout: {
      type: "pooja",
      label: "Sattvic Temple Standard",
      text: "Clean combustion, natural aroma, and 100% unadulterated cow purity for lamps and havan offerings.",
    },
    tags: ["Temple Deepam", "Clean Flame", "Agnihotra Sattvic"],
  },
  {
    id: 9,
    category: "storage",
    badge: "Care & Preservation",
    q: "How should I store Hariram’s Ghee, and what is its shelf life?",
    summary:
      "Hariram’s Pure Cow Ghee stays naturally fresh for 12 months in an ambient, dry pantry. Proper spoon hygiene is key.",
    highlights: [
      {
        title: "12 Months Natural Shelf Life",
        desc: "Pure clarified ghee has very low moisture content (<0.2%), preventing bacterial degradation without any chemical preservatives.",
      },
      {
        title: "Store in a Cool, Dry Pantry",
        desc: "Keep jar in a standard cupboard away from direct sunlight, gas burner heat, and humid steam.",
      },
      {
        title: "Golden Rule: Always Use a Dry Spoon",
        desc: "Even a single drop of water from a wet spoon can trigger microbial fermentation. Always use a dry stainless steel or wooden spoon.",
      },
    ],
    callout: {
      type: "alert",
      label: "Crucial Rule: DO NOT REFRIGERATE",
      text: "Refrigeration causes moisture condensation inside the jar upon opening, softening and destroying the authentic Danedar crystal matrix.",
    },
    tags: ["12 Months Shelf Life", "Do Not Refrigerate", "Dry Spoon Rule"],
  },
  {
    id: 10,
    category: "storage",
    badge: "Packaging & Transit",
    q: "How are glass jars protected during courier transit?",
    summary:
      "Every glass jar is packed in multi-layered, shock-absorbing protective armor and double-walled cartons to ensure 100% safe transit to your doorstep.",
    highlights: [
      {
        title: "Shockproof Protective Sleeves",
        desc: "High-density custom cushioning surrounds the glass jar, absorbing road bumps and transit drops.",
      },
      {
        title: "Tamper-Evident Safety Cap & Seal",
        desc: "Induction-sealed jar mouth and tamper-proof outer tape ensure fresh, untouched purity from our facility to your kitchen.",
      },
      {
        title: "Zero-Leakage Delivery Guarantee",
        desc: "If any jar is damaged in courier transit, our Chennai team immediately dispatches a free replacement without delay.",
      },
    ],
    callout: {
      type: "safety",
      label: "Safe Delivery Guarantee",
      text: "Dispatched within 24 hours of ordering with live tracking links and zero-leakage assurance across India.",
    },
    tags: ["Shockproof Packaging", "Tamper-Evident", "Transit Guarantee"],
  },
];

export default function FaqPage() {
  const navigate = useNavigate();
  const { data: seoConfig } = useConfig("seo");
  const [openIds, setOpenIds] = useState(() => new Set([1])); // Question #1 open by default like homepage
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Dynamic SEO Injection matching seo.json
  useEffect(() => {
    const pageSeo = seoConfig?.faq || {
      title: "Frequently Asked Questions — Pure Cow Ghee Science & Vedic Tradition",
      description:
        "Honest, scientifically-grounded answers on Danedar texture, Bilona churning, Vedic scripture quotes, evening consumption, lactose sensitivity, and storage.",
    };
    document.title = pageSeo.title;
    setMeta("description", pageSeo.description);
    setLink("canonical", pageSeo.canonical || window.location.href);
    setMeta("og:title", pageSeo.title, "property");
    setMeta("og:description", pageSeo.description, "property");
    setMeta("og:image", pageSeo.ogImage || "/assets/hariram_bottle_pasture.jpg", "property");

    // Inject FAQPage JSON-LD schema for Google Rich Results
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${item.summary} ${item.highlights.map((h) => `${h.title}: ${h.desc}`).join(" ")}`,
        },
      })),
    };
    let script = document.getElementById("faqpage-schema");
    if (!script) {
      script = document.createElement("script");
      script.id = "faqpage-schema";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(schema);

    return () => {
      const s = document.getElementById("faqpage-schema");
      if (s) s.remove();
    };
  }, [seoConfig]);

  // Toggle single accordion item (accordion style like Homepage)
  const toggleItem = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Accordion behavior: close other open items, open clicked one
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  // Expand all / Collapse all
  const expandAll = () => {
    setOpenIds(new Set(FAQ_ITEMS.map((item) => item.id)));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !query ||
        item.q.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query)) ||
        item.highlights.some((h) => h.title.toLowerCase().includes(query) || h.desc.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} className="py-6 lg:py-12 overflow-hidden">
      <div className="container-brand max-w-5xl mx-auto px-4 sm:px-6">

        {/* Top Breadcrumb & Share Actions */}
        <ScrollReveal direction="up" distance={10}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors cursor-pointer"
              style={{ color: "var(--brand-primary)", fontFamily: "'Poppins', Arial, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border bg-white/90 hover:bg-white transition-all shadow-2xs cursor-pointer"
              style={{ color: "var(--brand-primary)", borderColor: "var(--brand-border)", fontFamily: "'Poppins', Arial, sans-serif" }}
              title="Copy page link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Link Copied!" : "Share FAQ"}
            </button>
          </div>
        </ScrollReveal>

        {/* Grand Header Hero Banner with Realistic Pasture Accent */}
        <section className="relative rounded-3xl p-6 sm:p-10 lg:p-12 mb-10 overflow-hidden border border-[#EADFC7] shadow-sm bg-gradient-to-br from-[#FFFDF8] via-[#FFF6E6] to-[#FFF9F0]">
          {/* Top Golden Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading & Information */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <ScrollReveal direction="up" distance={15}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D4AF37]/50 shadow-2xs mb-4 text-xs font-semibold tracking-wider uppercase text-amber-900" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Clarity & Vedic Purity Truths</span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4 leading-[1.18]"
                  style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Frequently Asked Questions
                </h1>

                <p
                  className="text-stone-700 text-sm sm:text-base leading-relaxed mb-6 font-normal"
                  style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                >
                  Honest, scientifically-proven, and scripturally validated answers about our traditional Bilona craft, Danedar crystallization, digestion, and daily storage.
                </p>

                {/* Quick Trust Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-2 text-left" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-amber-900/10 shadow-2xs">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Method</div>
                    <div className="text-xs font-bold text-amber-900">Vedic Bilona Churned</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-amber-900/10 shadow-2xs">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Smoke Point</div>
                    <div className="text-xs font-bold text-amber-900">250°C (482°F)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-amber-900/10 shadow-2xs col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Shelf Life</div>
                    <div className="text-xs font-bold text-emerald-800">12 Months Ambient</div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Original Hariram Ghee Bottle on Natural Pasture Background */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <ScrollReveal direction="scale" distance={15} delay={100}>
                <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-xl bg-white group max-w-sm">
                  <img
                    src="/assets/hariram_bottle_pasture.jpg"
                    alt="Hariram's Pure Cow Ghee original 1L bottle on rustic wooden farm table with cows grazing in green pasture"
                    className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Caption */}
                  <div className="absolute bottom-3 left-4 right-4 text-white" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300">Hariram's Pure Cow Ghee</span>
                    </div>
                    <div className="text-xs text-stone-200 leading-snug">
                      100% authentic pure cow ghee crafted from cultured curd with natural Danedar crystals.
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Live Search & Filter Bar */}
        <ScrollReveal direction="up" distance={15} delay={120}>
          <div className="rounded-3xl p-5 sm:p-6 mb-8 bg-white border border-[#EADFC7] shadow-xs" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
              
              {/* Search Input */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search questions (e.g. Danedar, lactose, smoke point, storage)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 bg-stone-50/70 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Expand / Collapse Controls */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-700 text-white shadow-xs"
                        : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* 2-COLUMN SECTION: Realistic Pasture Feature Card + FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Main FAQ Accordion Column (8 Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-3xl p-10 text-center bg-white border border-[#EADFC7] shadow-xs">
                <Compass className="w-10 h-10 text-amber-600/60 mx-auto mb-2" />
                <h3 className="font-serif font-bold text-lg text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  No Questions Found
                </h3>
                <p className="text-xs text-stone-600 mb-4" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  No matching questions for "{searchQuery}". Try a different keyword or reset filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 transition cursor-pointer"
                  style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openIds.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl transition-all duration-300 border bg-white ${
                      isOpen
                        ? "border-amber-700/40 shadow-md ring-1 ring-amber-500/15"
                        : "border-[#EADFC7] hover:border-amber-600/30 hover:shadow-2xs"
                    }`}
                    style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                  >
                    {/* Accordion Question Header Bar */}
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 sm:gap-4 cursor-pointer focus:outline-hidden"
                      aria-expanded={isOpen}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded-md bg-amber-100/70 border border-amber-900/10">
                            {faq.badge}
                          </span>
                          <span className="text-[11px] text-stone-400 font-medium">
                            #{faq.id < 10 ? `0${faq.id}` : faq.id}
                          </span>
                        </div>
                        <h3
                          className="text-base sm:text-lg font-serif font-bold text-stone-950 leading-snug"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {faq.q}
                        </h3>
                      </div>

                      {/* Down-Pointing Chevron Arrow (Smoothly Rotates When Open) */}
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 mt-1 ${
                          isOpen
                            ? "rotate-180 bg-amber-600 text-white shadow-xs"
                            : "bg-amber-100/60 text-amber-900 hover:bg-amber-200/70"
                        }`}
                        title={isOpen ? "Collapse answer" : "Expand answer"}
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </button>

                    {/* Accordion Dropdown Answer Content */}
                    {isOpen && (
                      <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-amber-900/10 space-y-4 animate-in fade-in-50 duration-200">
                        {/* Summary Paragraph */}
                        <p className="text-xs sm:text-[14.5px] text-stone-700 leading-relaxed font-normal">
                          {faq.summary}
                        </p>

                        {/* Detailed Structured Highlights (Elevated Typographic Design) */}
                        <div className="space-y-2.5">
                          {faq.highlights.map((h, hIdx) => (
                            <div
                              key={hIdx}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-900/10"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                                <strong className="font-semibold text-stone-900">{h.title}: </strong>
                                <span>{h.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Highlight Callout Box */}
                        {faq.callout && (
                          <div
                            className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 ${
                              faq.callout.type === "alert"
                                ? "bg-rose-50 border-rose-200 text-rose-950"
                                : "bg-[#FFF9EE] border-amber-300/60 text-amber-950"
                            }`}
                          >
                            {faq.callout.type === "alert" ? (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">
                                {faq.callout.label}
                              </span>
                              <span>{faq.callout.text}</span>
                            </div>
                          </div>
                        )}

                        {/* Quick Topic Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {faq.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-semibold border border-stone-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Sticky Visual Feature Column (4 Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Visual 1: Realistic Farm Pasture Image Card */}
            <div className="rounded-3xl overflow-hidden border border-[#EADFC7] shadow-sm bg-white" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              <div className="relative group overflow-hidden">
                <img
                  src="/assets/faq_cows_pasture.jpg"
                  alt="Realistic South Indian cow herd grazing in green pasture"
                  className="w-full h-52 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                    Natural Free Grazing
                  </span>
                  <h4 className="font-serif font-bold text-sm text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Ethical South Indian Pastures
                  </h4>
                </div>
              </div>
              <div className="p-4 text-xs text-stone-600 leading-relaxed">
                Cows graze naturally in sunny South Indian meadows, yielding pure, nutrient-dense whole milk cultured into authentic A2 dahi before wooden churning.
              </div>
            </div>

            {/* Visual 2: Authentic Bilona Wooden Churn Card */}
            <div className="rounded-3xl overflow-hidden border border-[#EADFC7] shadow-sm bg-white" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              <div className="relative group overflow-hidden">
                <img
                  src="/assets/bilona_churn.jpg"
                  alt="Authentic wooden bilona mathani churning pot"
                  className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                    Vedic Engineering
                  </span>
                  <h4 className="font-serif font-bold text-sm text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Bi-Directional Wooden Mathani
                  </h4>
                </div>
              </div>
              <div className="p-4 text-xs text-stone-600 leading-relaxed">
                Low-velocity clockwise and counter-clockwise rotation preserves delicate short-chain fatty acids without high-speed centrifugal shear.
              </div>
            </div>

            {/* Quick Action: Shop Pure Cow Ghee */}
            <div
              className="rounded-3xl p-6 text-center border border-amber-900/20 shadow-sm"
              style={{
                background: "linear-gradient(135deg, #FAF3E6 0%, #FFFDF9 100%)",
                fontFamily: "'Poppins', Arial, sans-serif",
              }}
            >
              <div className="w-10 h-10 rounded-full bg-amber-600/15 text-amber-800 flex items-center justify-center mx-auto mb-3">
                <Droplets className="w-5 h-5 text-amber-700" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-950 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Taste The Authentic Danedar
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Experience traditional pure cow ghee packed in protective glass jars delivered straight to your home.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition"
              >
                <span>Shop Pure Cow Ghee</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>

        {/* Concierge Support Section: Have an Unanswered Question? */}
        <ScrollReveal direction="up" distance={20}>
          <section
            className="rounded-3xl p-6 sm:p-10 border border-[#EADFC7] shadow-sm relative overflow-hidden bg-white text-center sm:text-left"
            style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                  <span>We Are Here For You</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Have an Unanswered Question?
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Our founding family is always ready to guide you on daily wellness, temple orders, or doorstep delivery in Chennai and across India.
                </p>
              </div>

              <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2.5">
                <a
                  href="https://wa.me/919500021456?text=Hi%20Hariram's%20Team,%20I%20have%20a%20question%20about%20Pure%20Cow%20Ghee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>

                <a
                  href="tel:+919500021456"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-semibold text-xs tracking-wider transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                  <span>+91 95000 21456</span>
                </a>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
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
