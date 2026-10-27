import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Flame, 
  Moon, 
  Sunset, 
  Heart, 
  Droplets, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Quote,
  UtensilsCrossed,
  Check
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useConfig } from "@/hooks/useConfig";

const PILLARS = [
  {
    step: "01",
    title: "100% Pure Cow Milk Fat",
    subtitle: "Zero Additives, Zero Adulteration",
    description: "Prepared from wholesome, pure cow milk with nothing added and nothing taken away. Free from palm oil, artificial colours, chemical preservatives, or synthetic aromas.",
    icon: Droplets,
    badge: "100% Pure",
    feature: "Zero Adulteration",
  },
  {
    step: "02",
    title: "Authentic Danedar Texture",
    subtitle: "Natural Golden Granules",
    description: "Slow, natural room-temperature settling allows golden crystals to form effortlessly. These delicate granules melt instantly on hot Ponni rice, warm idlis, or crispy dosais.",
    icon: Sparkles,
    badge: "Danedar Texture",
    feature: "Melts at 36°C",
  },
  {
    step: "03",
    title: "Traditional Slow Simmer",
    subtitle: "Golden Hue & Nutty Aroma",
    description: "Clarified gently over a controlled flame in heavy-bottomed vessels, releasing an authentic, appetizing aroma that fills your entire kitchen—just like homemade grandmother's ghee.",
    icon: Flame,
    badge: "Slow Simmered",
    feature: "Nutty Fragrance",
  },
  {
    step: "04",
    title: "High 250°C Smoke Point",
    subtitle: "Safe, Nutritious Everyday Cooking",
    description: "With a smoke point well above 250°C (482°F), it does not burn or break down into harmful free radicals, making it ideal for daily South Indian tadkas, roasting, and festive sweets.",
    icon: ShieldCheck,
    badge: "250°C Smoke Point",
    feature: "Ideal for Roasting",
  },
];

export default function WhyHariramPage() {
  const { data: seoConfig } = useConfig("seo");
  const [activePillar, setActivePillar] = useState(0);

  useEffect(() => {
    const pageSeo = seoConfig?.why_hariram || {
      title: "Why Hariram's — 100% Pure Cow Ghee | Traditional Danedar Aroma",
      description: "Experience the authentic golden Danedar granules, rich traditional aroma, and 100% pure cow ghee benefits of Hariram's. Perfect for daily family health, South Indian cooking, and sacred poojas.",
    };
    document.title = pageSeo.title;
    setMeta("description", pageSeo.description);
    setLink("canonical", pageSeo.canonical || window.location.href);
    setMeta("og:title", pageSeo.title, "property");
    setMeta("og:description", pageSeo.description, "property");
  }, [seoConfig]);

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} className="py-6 lg:py-12 overflow-hidden">
      <div className="container-brand max-w-6xl mx-auto px-4 sm:px-6">

        {/* 1. CINEMATIC HERO SECTION WITH LOGO & PRODUCT BOTTLE */}
        <section className="relative rounded-3xl p-6 sm:p-10 lg:p-14 border border-[#EADFC7] shadow-sm mb-16 overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-[#FFF6E6] to-[#FFF9F0]">
          {/* Top Golden Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Brand Crest & Value Proposition */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <ScrollReveal direction="up" distance={15}>
                {/* Official Business Logo Badge */}
                <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/90 border border-[#D4AF37]/50 shadow-2xs mb-5">
                  <img
                    src="/assets/logo/logo.webp"
                    alt="Hariram's Official Crest"
                    className="w-9 h-9 object-contain rounded-full bg-amber-50"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-900 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      HARIRAM HOME NEEDS
                    </div>
                    <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                      Pure by Tradition • Honest by Choice
                    </div>
                  </div>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-stone-950 mb-4 leading-[1.18]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
                >
                  The Golden Purity of Pure Cow Ghee
                </h1>

                <p
                  className="text-base sm:text-lg text-stone-700 leading-relaxed mb-6 font-normal"
                  style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                >
                  Hariram’s brings to your family the unforgettable aroma and authentic golden <strong className="font-semibold text-stone-900">Danedar texture</strong> of genuine cow ghee. Prepared with honesty and care, free from all additives and artificial flavourings, exactly as tradition intended.
                </p>

                {/* Quick Trust Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 shadow-2xs text-center sm:text-left">
                    <div className="text-xs text-stone-500 uppercase font-semibold">Texture</div>
                    <div className="text-sm font-bold text-amber-900">Golden Danedar</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 shadow-2xs text-center sm:text-left">
                    <div className="text-xs text-stone-500 uppercase font-semibold">Smoke Point</div>
                    <div className="text-sm font-bold text-amber-900">250°C (482°F)</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 shadow-2xs text-center sm:text-left col-span-2 sm:col-span-1">
                    <div className="text-xs text-stone-500 uppercase font-semibold">Purity Standard</div>
                    <div className="text-sm font-bold text-emerald-800">100% Additive-Free</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    to="/shop"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                  >
                    <span>Order Pure Cow Ghee</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#pillars"
                    className="px-5 py-3 rounded-xl bg-white hover:bg-amber-50/70 border border-amber-900/20 text-stone-800 font-semibold text-xs uppercase tracking-wider transition-all"
                    style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                  >
                    Discover Key Benefits
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Visual Stage with Golden Danedar Ghee & Jar */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <ScrollReveal direction="scale" distance={20} delay={100}>
                <div className="relative w-full max-w-md mx-auto">
                  {/* Real Macro Danedar Photography Frame */}
                  <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-xl bg-white group">
                    <img
                      src="/assets/vedic_danedar_ghee.jpg"
                      alt="Authentic Danedar Cow Ghee in Brass Bowl"
                      className="w-full h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Overlay Label */}
                    <div className="absolute bottom-4 left-4 right-4 text-white" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs uppercase font-bold tracking-widest text-amber-300">Authentic Danedar Texture</span>
                      </div>
                      <div className="text-sm font-medium text-stone-200">
                        Natural golden granules that melt smoothly on warm rice without any oily aftertaste.
                      </div>
                    </div>
                  </div>

                  {/* Floating Hariram's Bottle Accent */}
                  <div className="absolute -bottom-6 -right-4 sm:-right-6 w-32 sm:w-36 p-2 rounded-2xl bg-white/95 border border-[#D4AF37] shadow-xl backdrop-blur-sm flex flex-col items-center text-center animate-bounce-slow">
                    <img
                      src="/assets/products/HG1000_front.png"
                      alt="Hariram's 1L Pure Cow Ghee Bottle"
                      className="h-24 sm:h-28 object-contain drop-shadow-md"
                    />
                    <div className="text-[10px] font-bold text-amber-900 mt-1 uppercase" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                      1000 ml Glass Jar
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 2. THE 4 PILLARS OF HARIRAM'S PURE GHEE */}
        <section id="pillars" className="mb-16">
          <ScrollReveal direction="up" distance={15}>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="gold-ornament mb-2" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-900/15 text-xs font-bold uppercase tracking-wider text-amber-900 mb-3" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>The 4 Golden Hallmarks</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
              >
                What Sets Hariram's Cow Ghee Apart
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                Honest quality, traditional cooking aroma, and 100% natural pure cow milk goodness trusted by thousands of South Indian households.
              </p>
            </div>
          </ScrollReveal>

          {/* Interactive Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
            {PILLARS.map((plr, i) => {
              const Icon = plr.icon;
              const isSelected = activePillar === i;
              return (
                <ScrollReveal key={plr.step} staggerIndex={i} direction="up" distance={20} className="h-full">
                  <div
                    onClick={() => setActivePillar(i)}
                    className={`h-full p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#FFFDF9] border-[#B8860B] shadow-md ring-2 ring-amber-500/20 scale-[1.02]"
                        : "bg-white border-[#EADFC7] hover:border-amber-400 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-2xl font-serif font-bold text-amber-700" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {plr.step}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {plr.badge}
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-3">
                        <Icon className="w-5 h-5" />
                      </div>

                      <h3 className="font-serif font-bold text-lg text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {plr.title}
                      </h3>
                      <div className="text-xs text-amber-800 font-semibold mb-3">
                        {plr.subtitle}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {plr.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-amber-900/10 flex items-center justify-between text-xs text-stone-500">
                      <span>Advantage:</span>
                      <strong className="text-stone-900 font-semibold">{plr.feature}</strong>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* 3. SOUTH INDIAN CULINARY HERITAGE (FEATURING GHEE ROAST DOSAI) */}
        <section className="mb-16">
          <ScrollReveal direction="up" distance={20}>
            <div className="rounded-3xl p-6 sm:p-10 border border-[#EADFC7] shadow-sm bg-gradient-to-br from-[#FFFDF9] to-[#FFF7E8] overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Authentic South Indian Ghee Roast Photo */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300 shadow-lg group">
                    <img
                      src="/assets/ghee_roast_banana_leaf.jpg"
                      alt="Golden South Indian Crispy Ghee Roast Dosai with Coconut and Tomato Chutneys"
                      className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-300">South Indian Tradition</span>
                      <p className="text-sm font-semibold">Golden Ney Roast Dosai on fresh banana leaf</p>
                    </div>
                  </div>
                </div>

                {/* Right: Culinary Context */}
                <div className="lg:col-span-7" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
                    <span>The Heart of Tamil Cuisine</span>
                  </div>

                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
                  >
                    From Crispy Ney Roast to Festive Payasam
                  </h2>

                  <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-6">
                    In South Indian homes, ghee is never just a cooking medium—it is the soul of hospitality and celebration. A single dollop of Hariram’s Pure Cow Ghee elevates every cherished recipe:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="p-3.5 rounded-2xl bg-white border border-amber-900/10 shadow-2xs flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                        01
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Crispy Ney Roast Dosai</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">Golden, fragrant crust that crackles to the bite with unmatched aroma.</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-amber-900/10 shadow-2xs flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                        02
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Steaming Venn Pongal</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">Infused with freshly roasted cashews, black pepper, and pure golden ghee.</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-amber-900/10 shadow-2xs flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                        03
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Hot Paruppu Sadam (Dal Rice)</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">The comforting first course of every South Indian family meal.</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-amber-900/10 shadow-2xs flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                        04
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">Festive Sweets & Mysore Pak</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">Melt-in-the-mouth texture and rich traditional festive fragrance.</div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    <span>Bring Home the Taste of Tradition</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 4. SANATANA DHARMA & ANCIENT WISDOM (NO HINDI, CLEAN ENGLISH TRANSLATIONS) */}
        <section className="mb-16">
          <ScrollReveal direction="up" distance={20}>
            <div className="rounded-3xl p-8 sm:p-12 border border-[#E8DCB8] shadow-md relative overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-[#FAF4E6] to-[#FFF9F0]">
              {/* Background Watermark Crest */}
              <img
                src="/assets/logo/logo.webp"
                alt=""
                className="absolute right-6 -bottom-10 w-64 h-64 opacity-5 pointer-events-none"
              />

              <div className="max-w-3xl mx-auto text-center mb-8">
                <span className="gold-ornament mb-2" />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-900/15 text-xs font-bold uppercase tracking-wider text-amber-900 mb-2" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sanatana Dharma & Classical Wellness</span>
                </div>
                <h2
                  className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
                >
                  Ancient Heritage: The Supreme Essence of Ghrita
                </h2>
                <p className="text-stone-600 text-sm max-w-2xl mx-auto" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  In ancient classical traditions and Vedic literature, pure cow ghee has always been treasured as the purest medium for family health, temple offerings, and lifelong vitality.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Charaka Samhita Card */}
                <div className="p-6 rounded-2xl bg-white/90 border border-amber-900/15 shadow-xs relative">
                  <Quote className="w-8 h-8 text-amber-600/20 absolute top-4 right-4" />
                  <div className="text-xs uppercase font-bold text-amber-800 mb-2" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                    Charaka Samhita • Classical Ayurvedic Wisdom
                  </div>
                  <h3
                    className="text-stone-900 text-base sm:text-lg font-serif font-bold leading-snug mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    "Sarva Sneha Uttamam" — The Supreme Essence of All Wholesome Fats
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-amber-900/10 pt-3" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                    Ayurvedic classical texts extol pure cow ghee as the foremost of all culinary fats. It is naturally cooling to the body, gently kindles the digestive fire without irritation, supports sharp intellect and clarity (Medhya), and strengthens overall family vitality (Ojas).
                  </p>
                </div>

                {/* Rigveda & Temple Traditions Card */}
                <div className="p-6 rounded-2xl bg-white/90 border border-amber-900/15 shadow-xs relative">
                  <Quote className="w-8 h-8 text-amber-600/20 absolute top-4 right-4" />
                  <div className="text-xs uppercase font-bold text-amber-800 mb-2" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                    Sacred Vedic Traditions & Temple Worship
                  </div>
                  <h3
                    className="text-stone-900 text-base sm:text-lg font-serif font-bold leading-snug mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    The Sacred Spark of Auspicious Deepams & Prasadam
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-amber-900/10 pt-3" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                    From lighting the auspicious vilakku (brass lamp) at dawn to preparing sacred temple prasadam and homa offerings, pure cow ghee has stood as the eternal symbol of truth, purity, and spiritual elevation across South Indian culture.
                  </p>
                </div>
              </div>

              {/* The 4 Cherished Family Samskaras Grid */}
              <div className="mt-8 pt-8 border-t border-amber-900/15 text-center" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                <h4 className="font-serif font-bold text-lg text-stone-900 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  A Lifelong Companion in Sacred Family Milestones
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-amber-900/10">
                    <div className="text-xs font-bold text-amber-900">1. Jatakarma</div>
                    <div className="text-[11px] text-stone-600 mt-1">Infant birth blessing: first drops of pure ghee for health and sharpness.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-amber-900/10">
                    <div className="text-xs font-bold text-amber-900">2. Annaprashana</div>
                    <div className="text-[11px] text-stone-600 mt-1">Baby's first solid food: mashed paruppu sadam sweetened with golden ghee.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-amber-900/10">
                    <div className="text-xs font-bold text-amber-900">3. Pooja & Deepam</div>
                    <div className="text-[11px] text-stone-600 mt-1">Illuminating the household altar with a clear, fragrant, smokeless flame.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-amber-900/10">
                    <div className="text-xs font-bold text-amber-900">4. Grihapravesam</div>
                    <div className="text-[11px] text-stone-600 mt-1">New home celebrations: boiling fresh milk and sharing ghee sweets for prosperity.</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 5. EVENING WELLNESS RITUAL (REALISTIC BACKGROUND WITH HARIRAM'S BOTTLE) */}
        <section className="mb-16">
          <ScrollReveal direction="up" distance={20}>
            <div
              className="rounded-3xl p-8 sm:p-12 border shadow-2xl relative overflow-hidden text-white group"
              style={{
                borderColor: "rgba(216, 155, 34, 0.45)",
                fontFamily: "'Poppins', Arial, sans-serif",
              }}
            >
              {/* Realistic Hariram's Bottle on Teak Table Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{
                  backgroundImage: "url('/assets/hariram_evening_bottle_bg.jpg')",
                }}
              />

              {/* Atmospheric Evening & Warm Glow Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(20, 26, 38, 0.82) 50%, rgba(26, 18, 10, 0.78) 100%)",
                }}
              />

              {/* Warm Golden Ghee Radiance Spheres */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                    <Moon className="w-3.5 h-3.5 text-amber-300" />
                    <span>Evening Wellness & Restorative Ritual</span>
                  </div>

                  <h2
                    className="text-2xl sm:text-4xl font-serif font-bold text-white mb-4 leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Why Enjoy Hariram’s Ghee in the Evening?
                  </h2>

                  <p className="text-stone-200 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    After a long day, traditional Indian wisdom recommends a comforting spoonful of pure cow ghee with your evening meal or warm bedtime drink:
                  </p>

                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition">
                      <Sunset className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-amber-200">1. Soothes Digestion & Calms the Body</div>
                        <div className="text-xs text-stone-300 mt-0.5">Warm ghee gently coats the digestive lining, easing acidity and helping your stomach settle comfortably for the night.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition">
                      <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-amber-200">2. Natural Source of Nourishing Butyric Acid</div>
                        <div className="text-xs text-stone-300 mt-0.5">Short-chain fatty acids provide steady nourishment to intestinal cells during your overnight rest.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition">
                      <Moon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-amber-200">3. Promotes Peaceful, Restful Sleep</div>
                        <div className="text-xs text-stone-300 mt-0.5">Combined with warm milk, healthy milk lipids soothe tiredness and support deep, uninterrupted rest for the whole family.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evening Recipe Teaser Card */}
                <div className="lg:col-span-5">
                  <div className="relative p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-amber-400/30 backdrop-blur-lg text-center shadow-2xl hover:border-amber-400/60 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-300 shadow-inner">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">Traditional Nightcap</div>
                    <h3 className="font-serif font-bold text-xl text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Warm Golden Turmeric Elixir
                    </h3>
                    <p className="text-xs text-stone-200 leading-relaxed mb-4">
                      1 cup warm milk + pinch of pure turmeric + crushed cardamom + <strong className="text-amber-300 font-bold">1 tsp Hariram’s Pure Cow Ghee</strong> 30 minutes before sleep.
                    </p>
                    <Link
                      to="/recipes"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                    >
                      <span>Explore Healthy Recipes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 6. COMPETITIVE COMPARISON: HARIRAM'S VS MASS MARKET GHEE */}
        <section className="mb-16">
          <ScrollReveal direction="up" distance={20}>
            <div className="rounded-3xl p-6 sm:p-10 border border-[#EADFC7] shadow-xs bg-white" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="gold-ornament mb-2" />
                <h2
                  className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
                >
                  Honest Quality Comparison
                </h2>
                <p className="text-xs sm:text-sm text-stone-600">
                  See how Hariram’s 100% Pure Cow Ghee stands above commercial factory alternatives.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-amber-900/15">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF3E6] border-b border-amber-900/15 text-stone-900 font-serif font-bold">
                      <th className="p-3.5 sm:p-4">Quality Factor</th>
                      <th className="p-3.5 sm:p-4 text-stone-600">Mass-Market Factory Ghee</th>
                      <th className="p-3.5 sm:p-4 bg-amber-100/60 text-amber-950">Hariram's Pure Cow Ghee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-amber-900/10">
                      <td className="p-3.5 sm:p-4 font-semibold text-stone-900">Purity & Ingredients</td>
                      <td className="p-3.5 sm:p-4 text-stone-600">Blended fats, vegetable oil fillers, or residual cream</td>
                      <td className="p-3.5 sm:p-4 bg-amber-50/50 font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Pure Cow Milk Fat
                      </td>
                    </tr>
                    <tr className="border-b border-amber-900/10">
                      <td className="p-3.5 sm:p-4 font-semibold text-stone-900">Texture & Granules</td>
                      <td className="p-3.5 sm:p-4 text-stone-600">Flat, waxy, paste-like consistency</td>
                      <td className="p-3.5 sm:p-4 bg-amber-50/50 font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Authentic golden Danedar grains
                      </td>
                    </tr>
                    <tr className="border-b border-amber-900/10">
                      <td className="p-3.5 sm:p-4 font-semibold text-stone-900">Aroma & Fragrance</td>
                      <td className="p-3.5 sm:p-4 text-stone-600">Synthetic aroma additives (diacetyl essence)</td>
                      <td className="p-3.5 sm:p-4 bg-amber-50/50 font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% natural slow-simmered nutty aroma
                      </td>
                    </tr>
                    <tr className="border-b border-amber-900/10">
                      <td className="p-3.5 sm:p-4 font-semibold text-stone-900">Smoke Point for Cooking</td>
                      <td className="p-3.5 sm:p-4 text-stone-600">Low smoke point; burns quickly during frying</td>
                      <td className="p-3.5 sm:p-4 bg-amber-50/50 font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> High 250°C (482°F) heat tolerance
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-semibold text-stone-900">Sacred Pooja Suitability</td>
                      <td className="p-3.5 sm:p-4 text-stone-600">Unsuitable for pure temple rituals</td>
                      <td className="p-3.5 sm:p-4 bg-amber-50/50 font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Sattvic & pure for deepams
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 7. BOTTOM CALL TO ACTION */}
        <ScrollReveal direction="up" distance={15}>
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#174C2B] to-[#0F3620] text-white shadow-lg relative overflow-hidden" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
            <div className="max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center mx-auto mb-3 text-amber-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Pure by Tradition. Honest by Choice.
              </h3>
              <p className="text-amber-100/80 text-sm leading-relaxed mb-6">
                Bring home the golden taste of authentic South Indian heritage. Delivered safely in secure glass jars directly to your doorstep in Chennai and across India.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <span>Shop Hariram's Pure Cow Ghee</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
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
