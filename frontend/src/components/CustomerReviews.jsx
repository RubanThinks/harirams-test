import React from "react";
import { Star, CheckCircle, Quote, ThumbsUp } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const REVIEWS = [
  {
    name: "Meenakshi Sundaram",
    location: "Mylapore, Chennai",
    variant: "1000 ml pack",
    stars: 5,
    title: "Reminds me of my grandmother's ghee in Thanjavur",
    quote: "The aroma when you open the seal is extraordinary. I put half a spoon on hot steamed rice with sambar, and the whole kitchen smelled divine. The granular Danedar texture is 100% genuine traditional quality. Never buying supermarket brands again.",
    date: "Verified Buyer • 3 days ago",
  },
  {
    name: "Dr. K. Raghuraman",
    location: "RS Puram, Coimbatore",
    variant: "500 ml pack",
    stars: 5,
    title: "Best for my 1-year-old child's daily paruppu saatham",
    quote: "As a pediatrician and parent, purity is non-negotiable for me. Hariram's ghee is light on the stomach, zero acidity, and my daughter loves the natural nutty sweetness. Highly recommended for infants and elders.",
    date: "Verified Buyer • 1 week ago",
  },
  {
    name: "Sowmya Venkat",
    location: "Indiranagar, Bangalore",
    variant: "5 Litre Functions pack",
    stars: 5,
    title: "Made Mysore Pak for Diwali — guests were raving!",
    quote: "Ordered the 5L tin for our family wedding and festival sweets. The ghee clarifies cleanly without burning and gives that melt-in-mouth texture to sweets that only pure cow ghee can produce. Prompt delivery and packaging was solid.",
    date: "Verified Buyer • 2 weeks ago",
  },
];

export default function CustomerReviews() {
  return (
    <section
      id="reviews"
      className="w-full py-16 lg:py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fffcf5 0%, var(--brand-cream) 100%)" }}
      aria-label="Customer Reviews"
    >
      <div className="container-brand relative z-10">
        <ScrollReveal direction="up" distance={25}>
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
            <div className="flex items-center justify-center mb-2">
              <span className="gold-ornament" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill mb-3 text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--brand-secondary)" }}>
              <ThumbsUp className="w-3.5 h-3.5" /> Loved By 4,800+ Families
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif" style={{ color: "var(--brand-primary)" }}>
              Words From Our Patrons
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-price font-bold text-lg text-stone-900">4.9 / 5.0</span>
              <span className="text-xs text-stone-500 font-medium">(Verified Family Reviews)</span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {REVIEWS.map((rev, idx) => (
            <ScrollReveal key={rev.name} staggerIndex={idx} direction="up" distance={25}>
              <div className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-3xl liquid-glass-card border border-amber-900/10 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div>
                  {/* Stars + Quote Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: rev.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-7 h-7 text-amber-700/25" />
                  </div>

                  {/* Title & Quote */}
                  <h4 className="text-base font-serif font-bold text-stone-900 mb-2 leading-snug">
                    "{rev.title}"
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                    "{rev.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-5 mt-5 border-t border-amber-900/10 flex items-center justify-between">
                  <div>
                    <div className="font-serif font-bold text-sm text-stone-900">
                      {rev.name}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {rev.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{rev.variant}</span>
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {rev.date.split("•")[1]}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
