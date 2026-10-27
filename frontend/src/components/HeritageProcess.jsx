import React from "react";
import { Sparkles, HeartHandshake, Flame, Sun, Flower2, Gift, UtensilsCrossed } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const VEDIC_PILLARS = [
  {
    num: "01",
    title: "The Vedic Tradition of Ghritha Danam",
    icon: Gift,
    tag: "Sacred Arogya Giving",
    desc: "In ancient Vedic philosophy (Atharva Veda & Charaka Samhita), gifting or donating pure cow ghee to loved ones, elders, teachers, or someone in convalescence is revered as 'Ghritha Danam'—an auspicious offering believed to dispel chronic ailments, nurture vital life force, and invite lifelong Arogya (holistic well-being).",
  },
  {
    num: "02",
    title: "Lighting Sacred Deepams & Purifying Space",
    icon: Flame,
    tag: "Satvik Household Aura",
    desc: "Lighting a pure cow ghee lamp at dawn and dusk is an unbroken South Indian tradition. The gentle sattvic flame purifies indoor air, dissipates lethargy, and fills the home with divine peace, auspicious vibrations, and tranquil focus.",
  },
  {
    num: "03",
    title: "Pure Satvik Nourishment for Body & Mind",
    icon: Sun,
    tag: "Harmony of Mind (Sattva)",
    desc: "In Ayurveda, pure cow ghee is classified as supreme Satvik food—nourishment that fosters mental clarity, gentle kindness, emotional stability, and inner vitality (Ojas) without creating heaviness or sluggishness.",
  },
  {
    num: "04",
    title: "Generational South Indian Culinary Love",
    icon: UtensilsCrossed,
    tag: "The Golden Daily Drizzle",
    desc: "From baby's first spoonful of warm paruppu saatham (lentil rice) to celebratory Pongal and crispy ghee dosas, pure cow ghee is the sacred thread of generational affection connecting South Indian kitchens for centuries.",
  },
];

export default function HeritageProcess() {
  return (
    <section
      id="vedic-heritage"
      className="w-full py-16 lg:py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--brand-cream) 0%, #fffcf5 100%)" }}
      aria-label="Vedic Heritage and Traditions"
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
              <Sparkles className="w-3.5 h-3.5" /> Ancient Vedic Wisdom & Sacred Heritage
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif" style={{ color: "var(--brand-primary)" }}>
              The Sacred Tradition of Ghritha Danam
            </h2>
            <p className="mt-3 text-sm lg:text-base leading-relaxed" style={{ color: "var(--brand-muted)" }}>
              In classical Vedic wisdom, Pure Cow Ghee is celebrated as <em>Amrita</em>—the nectar of vitality. 
              Discover how gifting, sharing, and daily offerings of pure ghee bring holistic health, harmony, and spiritual warmth to every home.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Grid: Kitchen Image + 4 Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Visual Showcase (Warm rural kitchen hearth photo) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ScrollReveal direction="right" distance={30}>
              <div className="relative rounded-3xl overflow-hidden liquid-glass-card p-3 shadow-xl border border-amber-900/10">
                <div className="relative h-[380px] sm:h-[460px] rounded-2xl overflow-hidden bg-amber-50">
                  <img
                    src="/assets/bilona_churn.jpg"
                    alt="Traditional Indian kitchen hearth with golden cow ghee simmering"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs uppercase tracking-wider font-semibold text-amber-300 flex items-center gap-1.5">
                      <Flower2 className="w-3.5 h-3.5" /> Vedic Living
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold mt-1" style={{ color: "#ffffff" }}>
                      Nectar of Health (Arogyam)
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-200 mt-1 line-clamp-2">
                      Ancient texts describe Ghritha as the finest carrier of healing essence, soothing the spirit and restoring natural bodily harmony.
                    </p>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute top-6 right-6 px-3.5 py-2 rounded-xl liquid-glass text-xs font-bold text-amber-950 flex items-center gap-2 shadow-md">
                  <HeartHandshake className="w-4 h-4 text-emerald-700" />
                  <span>Sacred Giving & Healing</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Pillars List */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
            {VEDIC_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <ScrollReveal key={pillar.num} staggerIndex={idx} direction="up" distance={20}>
                  <div className="group relative rounded-2xl p-4 sm:p-5 liquid-glass-card hover:border-amber-900/25 transition-all duration-300 shadow-xs hover:shadow-md flex items-start gap-4">
                    {/* Number badge */}
                    <div
                      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-price font-bold text-base transition-colors"
                      style={{ background: "rgba(216, 155, 34, 0.15)", color: "var(--brand-primary)" }}
                    >
                      {pillar.num}
                    </div>

                    {/* Pillar details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold bg-amber-100/70 text-amber-900">
                          {pillar.tag}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-serif font-bold" style={{ color: "var(--brand-primary)" }}>
                        {pillar.title}
                      </h4>
                      <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                        {pillar.desc}
                      </p>
                    </div>

                    {/* Subtle icon */}
                    <Icon className="hidden sm:block shrink-0 w-5 h-5 text-amber-700/50 group-hover:text-amber-700 group-hover:scale-110 transition-all mt-2" />
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
