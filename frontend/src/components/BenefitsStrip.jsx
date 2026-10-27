import React from "react";
import { useConfig } from "@/hooks/useConfig";
import { TESTIDS } from "@/constants/testIds";
import { CircleDashed, ShieldCheck, Droplet, Bone, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const ICONS = {
  stomach: CircleDashed,
  shield: ShieldCheck,
  droplet: Droplet,
  bone: Bone,
  sparkles: Sparkles,
};

export default function BenefitsStrip() {
  const { data } = useConfig("benefits");
  const benefits = data?.benefits || [];

  return (
    <section
      data-testid={TESTIDS.benefits}
      className="w-full py-4 lg:py-6"
      style={{ background: "var(--brand-cream)" }}
      aria-label="Product benefits"
    >
      <div className="container-brand">
        <ScrollReveal direction="up" distance={20}>
          <div
            className="liquid-glass rounded-3xl relative overflow-hidden shadow-[0_12px_30px_-12px_rgba(59,36,20,0.08)] border border-amber-900/15"
          >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-4 gap-x-2 lg:gap-x-4 items-center p-4 lg:p-6">
            {benefits.map((b, i) => {
              const Icon = ICONS[b.icon] || Sparkles;
              return (
                <div
                  key={b.id}
                  data-testid={TESTIDS.benefit(b.id)}
                  className="flex items-center gap-3 lg:gap-4 px-2 lg:px-4 relative"
                >
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 h-14 w-px"
                      style={{ background: "var(--brand-secondary)", opacity: 0.35 }}
                    />
                  )}
                  <span
                    className="shrink-0 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full"
                    style={{
                      background: "var(--brand-cream)",
                      border: "1.5px solid var(--brand-secondary)",
                    }}
                  >
                    <Icon
                      className="w-6 h-6 lg:w-7 lg:h-7"
                      style={{ color: "var(--brand-secondary)" }}
                    />
                  </span>
                  <span
                    className="text-sm lg:text-[15px] font-semibold leading-snug"
                    style={{ color: "var(--brand-text)" }}
                  >
                    {b.title}
                  </span>
                </div>
              );
            })}

            {/* Cow & Calf illustration (from supplied benefits artwork, cropped visually) */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex justify-center lg:justify-end">
              <img
                src="/assets/ui/benefits.webp"
                alt="Illustration of a mother cow with calf on a grassy patch with flowers"
                className="h-24 lg:h-28 object-contain object-right"
                style={{ clipPath: "inset(15% 0 15% 82%)", marginRight: "-70%" }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
