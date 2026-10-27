import React from "react";
import { Sparkles, Heart, Activity, Droplets, Baby, Moon, Check, Award, Flame, SunMedium } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const HEALTH_USE_CASES = [
  {
    title: "Soothes Digestion & Fights Acid Reflux",
    badge: "Gut Healing & Agni",
    icon: Flame,
    desc: "In Ayurveda, pure cow ghee gently stimulates Jatharagni (the digestive fire) without increasing stomach acid. It naturally coats the delicate stomach lining, soothing gastritis, burning sensations, and acid reflux.",
    seoKeywords: "Digestive health, acid reflux relief, gentle on stomach, natural gut care",
  },
  {
    title: "Rich in Natural Butyric Acid for Gut Flora",
    badge: "Microbiome Support",
    icon: Activity,
    desc: "Cow ghee is nature's richest whole-food source of Butyric Acid—a vital short-chain fatty acid that repairs intestinal micro-tears, reduces gut inflammation, and supports healthy daily bowel regularity.",
    seoKeywords: "Butyric acid, healthy gut flora, colon wellness, easy digestion",
  },
  {
    title: "Wholesome Nourishment for Infants & Toddlers",
    badge: "Child Development",
    icon: Baby,
    desc: "South Indian mothers have trusted pure cow ghee for centuries. Mixed into baby's first warm paruppu saatham (dal rice), its bio-available healthy fats support rapid brain growth, strong bones, and healthy weight gain.",
    seoKeywords: "Pure cow ghee for babies, toddler nutrition, healthy fats for kids",
  },
  {
    title: "Natural Lubrication for Knees & Joints",
    badge: "Asthi Sneha",
    icon: Droplets,
    desc: "Acts as a biological internal lubricant that hydrates connective tissues and synovial joint fluid. Regular culinary use eases joint crackling, relieves morning stiffness, and maintains lifelong flexibility.",
    seoKeywords: "Joint lubrication, bone strength, mobility for seniors, Ayurvedic wellness",
  },
  {
    title: "Medhya Rasayana: Brain Clarity & Deep Sleep",
    badge: "Mind & Memory",
    icon: Moon,
    desc: "Classified as an adaptogenic Medhya tonic that crosses the blood-brain barrier. Half a spoonful in warm milk before bedtime calms the nervous system (Vata dosha), reduces anxiety, and encourages peaceful sleep.",
    seoKeywords: "Better sleep, mental clarity, Ayurvedic memory tonic, nervous system calming",
  },
  {
    title: "Yogavahi: Maximizes Nutrient Bioavailability",
    badge: "Nutrient Absorption",
    icon: Sparkles,
    desc: "Ayurveda honors ghee as 'Yogavahi'—a potent catalytic carrier that enhances cellular absorption of fat-soluble vitamins (A, D, E, K) and curative spices like turmeric, ginger, and black pepper.",
    seoKeywords: "Bioavailability enhancer, fat-soluble vitamins, Ayurvedic nutrition",
  },
];

const DAILY_RITUALS = [
  {
    time: "Morning Awakening",
    ritual: "1 tsp in warm water with a pinch of black pepper",
    benefit: "Gently wakes up digestion, lubricates the digestive tract, and promotes natural detox.",
  },
  {
    time: "Lunchtime Drizzle",
    ritual: "1 spoonful over steaming hot dal, sambar, or millets",
    benefit: "Lowers glycemic load, enhances spice absorption, and prevents post-meal lethargy.",
  },
  {
    time: "Afternoon Snack",
    ritual: "Lightly brushed over warm rotis, dosas, or idlis",
    benefit: "Provides clean, slow-burning fuel for active children and busy working adults.",
  },
  {
    time: "Bedtime Rest",
    ritual: "1/2 tsp stirred into warm milk with a pinch of turmeric",
    benefit: "Soothes the mind, relieves gastric discomfort, and invites deep, restorative sleep.",
  },
];

export default function PurityComparison() {
  return (
    <section
      id="ayurvedic-benefits"
      className="w-full py-16 lg:py-24 relative overflow-hidden"
      style={{ background: "var(--brand-cream)" }}
      aria-label="Ayurvedic Health Benefits and Use Cases"
    >
      <div className="container-brand relative z-10">
        {/* Section Heading */}
        <ScrollReveal direction="up" distance={25}>
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
            <div className="flex items-center justify-center mb-2">
              <span className="gold-ornament" />
            </div>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill mb-3 text-xs uppercase tracking-widest font-semibold"
              style={{ color: "var(--brand-secondary)" }}
            >
              <Award className="w-3.5 h-3.5" /> Holistic Health & Everyday Purpose
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif" style={{ color: "var(--brand-primary)" }}>
              Why Pure Cow Ghee Is Essential For Family Health
            </h2>
            <p className="mt-3 text-sm lg:text-base leading-relaxed" style={{ color: "var(--brand-muted)" }}>
              Far more than just a rich cooking medium, pure cow ghee is an Ayurvedic superfood. 
              Explore how its unique nutritional profile supports digestion, heals stomach sensitivity, and nurtures every stage of life.
            </p>
          </div>
        </ScrollReveal>

        {/* Spotlight Grid: Golden Texture Photo + Key Use Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-14">
          {/* Golden Texture Showcase */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="left" distance={25}>
              <div className="relative rounded-3xl overflow-hidden liquid-glass-card p-3 shadow-xl border border-amber-900/10">
                <div className="relative h-[360px] sm:h-[430px] rounded-2xl overflow-hidden bg-amber-50">
                  <img
                    src="/assets/golden_danedar.jpg"
                    alt="Golden granular cow ghee melting over authentic brass bowl"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs uppercase tracking-wider font-semibold text-amber-300 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5" /> Pure Golden Granules
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold mt-1" style={{ color: "#ffffff" }}>
                      Aromatic Danedar Crystals
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-200 mt-1 leading-relaxed">
                      Tiny golden crystals that dissolve effortlessly on warm rice, releasing an authentic nutty aroma and bioavailable nutrients.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Top 3 Quick Highlight Cards */}
          <div className="lg:col-span-7 space-y-4">
            {HEALTH_USE_CASES.slice(0, 3).map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} staggerIndex={idx} direction="up" distance={20}>
                  <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-amber-700/30 transition-all flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-amber-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="text-base font-serif font-bold text-stone-900">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* 3 Additional Deep Health Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {HEALTH_USE_CASES.slice(3, 6).map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} staggerIndex={idx} direction="up" distance={20}>
                <div className="h-full flex flex-col justify-between p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-amber-700/30 transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-900 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-amber-800" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded inline-block mb-2">
                      {item.badge}
                    </span>
                    <h4 className="text-base font-serif font-bold text-stone-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* SEO-Friendly Practical Daily Usage Table */}
        <ScrollReveal direction="up" distance={30}>
          <div className="rounded-3xl bg-white border border-stone-200/90 shadow-md overflow-hidden p-6 sm:p-8">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full mb-2">
                <SunMedium className="w-3.5 h-3.5 text-amber-800" /> Daily Wellness Guide
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Simple Ways to Incorporate Pure Cow Ghee Daily
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Small, mindful daily rituals that maximize digestive vitality and natural energy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DAILY_RITUALS.map((r, i) => (
                <div
                  key={r.time}
                  className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/50 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Step {i + 1} • {r.time}
                    </span>
                    <div className="font-semibold text-sm text-stone-900 mt-1.5 font-serif">
                      {r.ritual}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 mt-2.5 pt-2.5 border-t border-amber-200/40 leading-relaxed">
                    {r.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
