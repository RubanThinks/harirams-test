import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import { TESTIDS } from "@/constants/testIds";

/**
 * Hero carousel — displays supplied artwork (do not reconstruct with HTML).
 * The images already contain baked-in headline, sub-copy and CTA graphic.
 * We add a visually-transparent accessible CTA overlay + carousel controls.
 */
export default function HeroCarousel() {
  const { data: banners } = useConfig("hero_banners");
  const { data: siteCfg } = useConfig("site_config");
  const list = useMemo(
    () => (banners?.banners || []).filter((b) => b.enabled),
    [banners]
  );
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const intervalMs = (siteCfg?.rotationIntervalSeconds || 8) * 1000;

  useEffect(() => {
    if (!siteCfg?.heroRotation || list.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [list.length, intervalMs, siteCfg?.heroRotation]);

  if (!list.length) return null;
  const current = list[idx];

  const goto = (i) => {
    setIdx((i + list.length) % list.length);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(
        () => setIdx((k) => (k + 1) % list.length),
        intervalMs
      );
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      data-testid={TESTIDS.hero}
      className="relative w-full overflow-hidden"
      aria-label="Hero"
      style={{ background: "var(--brand-cream)" }}
    >
      <div className="relative">
        {list.map((b, i) => (
          <picture
            key={b.id}
            data-testid={TESTIDS.heroSlide(b.id)}
            className={`block ${i === idx ? "" : "hidden"}`}
          >
            <source media="(min-width: 1024px)" srcSet={b.desktop} />
            <source media="(min-width: 640px)"  srcSet={b.tablet} />
            <img
              src={b.mobile}
              alt={b.alt}
              className="hero-image"
              loading={i === 0 ? "eager" : "lazy"}
              fetchpriority={i === 0 ? "high" : "auto"}
            />
          </picture>
        ))}

        {/* Accessible transparent CTA over baked "SHOP PURE GHEE" area */}
        <button
          data-testid={TESTIDS.heroCta}
          onClick={scrollToProducts}
          className="hero-cta-hotspot"
          aria-label={current.cta || "Shop Pure Ghee"}
          style={{
            left: "3%",
            bottom: "8%",
            width: "24%",
            height: "12%",
            maxWidth: 320,
            maxHeight: 90,
          }}
        />

        {/* Prev / Next */}
        {list.length > 1 && (
          <>
            <button
              data-testid={TESTIDS.heroPrev}
              onClick={() => goto(idx - 1)}
              aria-label="Previous banner"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center bg-white/85 hover:bg-white shadow-lg transition"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
            </button>
            <button
              data-testid={TESTIDS.heroNext}
              onClick={() => goto(idx + 1)}
              aria-label="Next banner"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center bg-white/85 hover:bg-white shadow-lg transition"
            >
              <ChevronRight className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
            </button>
          </>
        )}

        {/* Dots */}
        {list.length > 1 && (
          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {list.map((b, i) => (
              <button
                key={b.id}
                data-testid={TESTIDS.heroDot(i)}
                onClick={() => goto(i)}
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === idx}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-8" : "w-2 bg-white/70"
                }`}
                style={{
                  background: i === idx ? "var(--brand-accent)" : undefined,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile-visible CTA below the image (in addition to hotspot) */}
      <div className="md:hidden container-brand py-5 flex justify-center">
        <button
          onClick={scrollToProducts}
          className="btn-primary"
          aria-label={current.cta || "Shop Pure Ghee"}
        >
          {current.cta || "Shop Pure Ghee"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
