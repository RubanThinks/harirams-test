import React, { useState, useEffect } from "react";
import { ChevronDown, HelpCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useConfig } from "@/hooks/useConfig";

const FAQS = [
  {
    q: "Why does Hariram's Ghee have a granular (Danedar) texture?",
    a: "Real granular texture (Danedar) is the natural hallmark of authentic pure cow ghee. When pure butter is gently clarified at a slow, controlled flame and allowed to cool naturally at room temperature, the natural milk fats crystallize into soft, aromatic golden granules that melt smoothly on hot rice and rotis.",
  },
  {
    q: "How should I store Hariram's Pure Cow Ghee, and what is its shelf life?",
    a: "Pure cow ghee has a natural shelf life of 12 months when stored in a cool, dry place away from direct sunlight. Do NOT refrigerate it, as moisture from the fridge can introduce condensation. Always use a dry, clean spoon to preserve its natural purity and aroma.",
  },
  {
    q: "Is Hariram's Ghee suitable for infants, toddlers, and elderly family members?",
    a: "Yes, absolutely! Pure cow ghee is naturally gentle on digestion, soothening the stomach lining and providing essential fat-soluble vitamins (A, D, E, K). In South Indian homes, mothers have trusted pure cow ghee for generations to mix with baby's first warm paruppu saatham (dal rice) to nurture natural immunity and healthy growth.",
  },
  {
    q: "Can I use Hariram's Ghee for daily temple pooja and sacred deepams?",
    a: "Yes. Hariram's Cow Ghee is 100% pure and authentic, free from artificial additives, synthetic fragrances, or adulterants. It burns cleanly with a tranquil, sacred aroma and is widely chosen for home poojas, temple deepams, and festive rituals across South India.",
  },
  {
    q: "How fast is shipping and how is the bottle protected during transit?",
    a: "All orders are dispatched within 24 hours of ordering. We use heavy-gauge, multi-layer shockproof cushioning and tamper-evident outer boxes so your ghee arrives fresh and pristine at your doorstep without any leakage.",
  },
];

/**
 * TypewriterAnswer
 * Delivers a ChatGPT-style progressive streaming typewriter effect with an active cursor.
 */
function TypewriterAnswer({ text, speed = 14 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;
    const len = text.length;
    // Chunk size: 2-3 characters per tick for smooth, snappy ChatGPT-like streaming
    const chunk = Math.max(1, Math.min(3, Math.ceil(len / 85)));

    const timer = setInterval(() => {
      index += chunk;
      if (index >= len) {
        setDisplayedText(text);
        setIsTyping(false);
        clearInterval(timer);
      } else {
        setDisplayedText(text.slice(0, index));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div
      className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-[14.5px] text-stone-700 leading-relaxed border-t border-amber-900/10 font-sans"
      style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
    >
      <span>{displayedText}</span>
      {isTyping && (
        <span
          className="inline-block w-1.5 h-3.5 sm:h-4 ml-1 bg-amber-600 rounded-2xs align-middle animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const { data: configFaq } = useConfig("faq");
  const list = configFaq?.faq && configFaq.faq.length > 0 ? configFaq.faq : FAQS;

  const toggle = (idx) => {
    setOpenIdx((cur) => (cur === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      className="w-full py-16 lg:py-24 relative overflow-hidden"
      style={{ background: "var(--brand-cream)" }}
      aria-label="Frequently Asked Questions"
    >
      <div className="container-brand relative z-10 max-w-4xl mx-auto">
        <ScrollReveal direction="up" distance={25}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-2">
              <span className="gold-ornament" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill mb-3 text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--brand-secondary)", fontFamily: "'Poppins', Arial, sans-serif" }}>
              <HelpCircle className="w-3.5 h-3.5" /> Clarity & Purity
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif" style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}>
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm lg:text-base" style={{ color: "var(--brand-muted)", fontFamily: "'Poppins', Arial, sans-serif" }}>
              Clear, honest answers about our traditional craft, storage, and health benefits.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {list.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <ScrollReveal key={faq.q} staggerIndex={idx} direction="up" distance={15}>
                <div
                  className={`rounded-2xl liquid-glass-card transition-all duration-300 border ${
                    isOpen
                      ? "border-amber-700/35 shadow-md bg-white/95"
                      : "border-amber-900/10 hover:border-amber-800/20 shadow-xs"
                  }`}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif font-bold text-base sm:text-lg text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {faq.q}
                    </span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-amber-600 text-white" : "bg-amber-100/70 text-amber-900"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <TypewriterAnswer key={`faq-answer-${idx}`} text={faq.a} />
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Link to Full Knowledge & FAQ page */}
        <div className="mt-10 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-200 hover:shadow-md cursor-pointer"
            style={{
              background: "white",
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
              fontFamily: "'Poppins', Arial, sans-serif",
            }}
          >
            <span>Explore All Vedic Purity Truths & Scriptural Proofs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
