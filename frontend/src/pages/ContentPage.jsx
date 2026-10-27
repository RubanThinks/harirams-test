import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, BookOpen, Sparkles, HelpCircle, PhoneCall, Compass, Share2, Check, Quote, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { apiClient } from "@/lib/api";
import { useConfig } from "@/hooks/useConfig";
import ScrollReveal from "@/components/ui/ScrollReveal";

const ROUTE_TO_ID = {
  "why-hariram": "why_hariram",
  "recipes": "recipes",
  "faq": "faq",
  "contact": "contact",
};

const PAGE_HEROES = {
  why_hariram: {
    badge: "Vedic Bio-Engineering & Sacred Geometry",
    title: "Why Hariram's Pure Cow Ghee",
    subtitle: "The architectural physics of Danedar Beta-Prime crystals, gentle bi-directional Bilona churning, and evening restorative chronobiology.",
    icon: Sparkles,
  },
  recipes: {
    badge: "South Indian Culinary Engineering",
    title: "Heritage Recipes & Golden Ratios",
    subtitle: "Thermal precision, 250°C smoke point golden caramelization, and divine traditional flavor balances.",
    icon: BookOpen,
  },
  faq: {
    badge: "Clarity & Purity Truths",
    title: "Frequently Asked Questions",
    subtitle: "Honest, scientifically-proven, and scripturally validated answers on purity, storage, and daily wellness.",
    icon: HelpCircle,
  },
  contact: {
    badge: "We Are For You",
    title: "Contact Us & Family Concierge",
    subtitle: "Direct human care from our founding family for home deliveries, temple trusts, and sacred pooja orders.",
    icon: PhoneCall,
  },
};

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = (location.pathname || "").replace(/^\//, "").split("/")[0];
  const id = ROUTE_TO_ID[slug] || "why_hariram";
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { data: seoConfig } = useConfig("seo");

  const hero = PAGE_HEROES[id] || PAGE_HEROES.why_hariram;
  const HeroIcon = hero.icon;

  useEffect(() => {
    let alive = true;
    setDoc(null);
    setError(null);
    apiClient
      .get(`/content/${id}`)
      .then((r) => alive && setDoc(r.data))
      .catch((e) => alive && setError(e.response?.data?.detail || "Page not found"));
    return () => {
      alive = false;
    };
  }, [id]);

  // Dynamic SEO Injection for titles, meta descriptions, canonicals, and openGraph
  useEffect(() => {
    const pageSeo = seoConfig?.[id];
    const pageTitle = pageSeo?.title || (doc?.title ? `${doc.title} — Hariram's Pure Cow Ghee` : "Hariram's Pure Cow Ghee");
    document.title = pageTitle;

    if (pageSeo) {
      setMeta("description", pageSeo.description);
      setMeta("keywords", (pageSeo.keywords || []).join(", "));
      setLink("canonical", pageSeo.canonical || window.location.href);
      setMeta("og:title", pageSeo.title, "property");
      setMeta("og:description", pageSeo.description, "property");
      setMeta("og:image", pageSeo.ogImage || "/assets/hero/mother_daughter/desktop.webp", "property");
      setMeta("og:url", pageSeo.canonical || window.location.href, "property");
      setMeta("og:type", "article", "property");
      setMeta("robots", pageSeo.robots || "index,follow");
    }

    // Inject JSON-LD Schema
    injectStructuredData(id, pageSeo, doc);

    return () => {
      const script = document.getElementById("jsonld-content-schema");
      if (script) script.remove();
    };
  }, [doc, id, seoConfig]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} data-testid={`content-page-${id}`} className="py-6 lg:py-12">
      <div className="container-brand max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Top Breadcrumb & Actions Bar */}
        <ScrollReveal direction="up" distance={12} delay={0}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              data-testid="content-back-btn"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors cursor-pointer"
              style={{ color: "var(--brand-primary)", fontFamily: "'Poppins', Arial, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border bg-white/90 hover:bg-white transition-all shadow-xs cursor-pointer"
              style={{ color: "var(--brand-primary)", borderColor: "var(--brand-border)", fontFamily: "'Poppins', Arial, sans-serif" }}
              title="Copy page link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Link Copied!" : "Share Page"}
            </button>
          </div>
        </ScrollReveal>

        {/* Dedicated Luxurious Page Hero Banner */}
        <ScrollReveal direction="up" distance={20} delay={80}>
          <section className="relative rounded-3xl p-8 sm:p-12 mb-10 overflow-hidden border shadow-sm text-center"
            style={{
              background: "linear-gradient(135deg, #FFFDF8 0%, #FFF5E4 50%, #FFF9EE 100%)",
              borderColor: "var(--brand-border)",
            }}
          >
            {/* Top Golden Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-wider uppercase border shadow-2xs"
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                borderColor: "rgba(216, 155, 34, 0.4)",
                color: "var(--brand-primary)",
                fontFamily: "'Poppins', Arial, sans-serif",
              }}
            >
              <HeroIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>{hero.badge}</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4 leading-tight"
              style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {hero.title}
            </h1>

            <p
              className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 leading-relaxed"
              style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
            >
              {hero.subtitle}
            </p>

            <div className="flex items-center justify-center mt-5">
              <span className="gold-ornament" />
            </div>
          </section>
        </ScrollReveal>

        {error ? (
          <div className="text-center py-16 rounded-3xl bg-white/90 border p-8 shadow-xs" style={{ borderColor: "var(--brand-border)" }}>
            <Compass className="w-12 h-12 mx-auto mb-3 text-amber-600/60" />
            <h2 className="text-xl font-bold mb-2 font-serif" style={{ color: "var(--brand-primary)" }}>Content Unavailable</h2>
            <p className="text-sm mb-6" style={{ color: "var(--brand-muted)", fontFamily: "'Poppins', Arial, sans-serif" }}>{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-sm shadow-sm hover:bg-amber-700 transition cursor-pointer"
              style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
            >
              Return to Storefront
            </button>
          </div>
        ) : !doc ? (
          <div className="text-center py-24 rounded-3xl bg-white/80 border shadow-xs" style={{ borderColor: "var(--brand-border)", color: "var(--brand-muted)" }}>
            <Loader2 className="w-8 h-8 animate-spin inline-block mb-3 text-amber-600" />
            <p className="text-sm font-medium" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>Invoking sacred knowledge…</p>
          </div>
        ) : (
          <ScrollReveal direction="up" distance={20} delay={140}>
            <article
              className="rounded-3xl border p-6 sm:p-10 lg:p-12 legal-body bg-white shadow-xs relative overflow-hidden"
              style={{ borderColor: "var(--brand-border)" }}
            >
              <ReactMarkdown
                components={{
                  // Hide the redundant markdown h1 since the Hero Banner already presents the grand title
                  h1: () => null,
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-2xl sm:text-3xl font-serif mt-10 mb-4 pb-2 border-b border-amber-800/15"
                      style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', Georgia, serif" }}
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-lg sm:text-xl font-serif font-bold mt-7 mb-2.5"
                      style={{ color: "var(--brand-primary-dark, #0F3620)", fontFamily: "'Playfair Display', Georgia, serif" }}
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="mb-4 text-stone-800 leading-relaxed text-[15.5px]"
                      style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li
                      className="mb-2.5 text-stone-800 text-[15.5px] leading-relaxed"
                      style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                      {...props}
                    />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="my-7 p-6 rounded-2xl bg-[#FFFDF7] border-l-4 border-amber-600 border border-amber-200/80 shadow-xs relative"
                    >
                      <Quote className="w-6 h-6 text-amber-600/30 absolute top-4 right-4" />
                      <div
                        className="text-stone-800 italic leading-relaxed text-base"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        {...props}
                      />
                    </blockquote>
                  ),
                  table: ({ node, ...props }) => (
                    <div className="w-full overflow-x-auto my-7 rounded-2xl border border-amber-900/15 shadow-2xs">
                      <table className="w-full text-left border-collapse" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="bg-[#FAF3E6] p-3.5 sm:p-4 font-serif font-bold text-stone-900 border-b border-amber-900/15 text-sm sm:text-base"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className="p-3.5 sm:p-4 border-b border-amber-900/5 text-stone-700 text-sm leading-relaxed"
                      style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                      {...props}
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <div
                      className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 my-6 text-stone-800 text-sm leading-relaxed"
                      style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                      {...props}
                    />
                  ),
                  code: ({ node, inline, ...props }) => (
                    <span
                      className="font-semibold px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-950 border border-amber-200 text-sm inline-block"
                      style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                      {...props}
                    />
                  ),
                }}
              >
                {doc.markdown || ""}
              </ReactMarkdown>

              {/* Bottom Heritage Sign-off */}
              <div className="mt-14 pt-8 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Hariram Home Needs • FSSAI: 12425002002875 • GST: 33DDOPS8117L2ZV</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Link to="/#products" className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold hover:underline">
                    Order Pure Cow Ghee Online <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

// Helpers for meta and structured data
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

function injectStructuredData(id, pageSeo, doc) {
  const existing = document.getElementById("jsonld-content-schema");
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.id = "jsonld-content-schema";
  script.type = "application/ld+json";

  const baseSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.harirams.in/#organization",
        "name": "HARIRAM HOME NEEDS",
        "url": "https://www.harirams.in",
        "logo": "https://www.harirams.in/assets/hero/mother_daughter/desktop.webp",
        "telephone": "+91 95000 21456",
        "email": "hariramhomeneeds@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Flat B12, Sidhartha Apartment, Balakrishnan Street, West Mambalam",
          "addressLocality": "Chennai",
          "addressRegion": "Tamil Nadu",
          "postalCode": "600033",
          "addressCountry": "IN"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${window.location.href}#webpage`,
        "url": window.location.href,
        "name": pageSeo?.title || doc?.title,
        "description": pageSeo?.description || "",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.harirams.in/" },
            { "@type": "ListItem", "position": 2, "name": doc?.title || id, "item": window.location.href }
          ]
        }
      }
    ]
  };

  script.text = JSON.stringify(baseSchema);
  document.head.appendChild(script);
}
