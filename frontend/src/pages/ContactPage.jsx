import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ExternalLink, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useConfig } from "@/hooks/useConfig";

export default function ContactPage() {
  const { data: seoConfig } = useConfig("seo");
  const { data: companyConfig } = useConfig("company");

  const phone = companyConfig?.customerCare || "+91 95000 21456";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const email = companyConfig?.email || "hariramhomeneeds@gmail.com";
  const hours = companyConfig?.customerCareHours || "Mon – Sat, 9:00 AM – 6:00 PM IST";
  const address = "Flat B12, Sidhartha Apartment, Balakrishnan Street, West Mambalam, Chennai - 600033, Tamil Nadu, India";
  const mapsUrl = "https://maps.google.com/?q=Flat+B12+Sidhartha+Apartment+Balakrishnan+Street+West+Mambalam+Chennai+600033";
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hello Hariram's team, I would like to inquire about Hariram's Pure Cow Ghee.")}`;

  useEffect(() => {
    const pageTitle = "Contact Us — Hariram's Pure Cow Ghee | West Mambalam, Chennai";
    const pageDesc = "Connect directly with Hariram Home Needs in West Mambalam, Chennai. Call or WhatsApp +91 95000 21456, email us, or order pure cow ghee online with pan-India delivery.";
    
    document.title = pageTitle;
    setMeta("description", pageDesc);
    setLink("canonical", "https://www.harirams.in/contact");
    setMeta("og:title", pageTitle, "property");
    setMeta("og:description", pageDesc, "property");
    setMeta("og:type", "website", "property");

    // LocalBusiness & ContactPage JSON-LD Schema
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "contact-jsonld";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ContactPage",
          "@id": "https://www.harirams.in/contact#webpage",
          "url": "https://www.harirams.in/contact",
          "name": pageTitle,
          "description": pageDesc,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.harirams.in/" },
              { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://www.harirams.in/contact" }
            ]
          }
        },
        {
          "@type": "LocalBusiness",
          "@id": "https://www.harirams.in/#localbusiness",
          "name": "HARIRAM HOME NEEDS",
          "legalName": "HARIRAM HOME NEEDS",
          "url": "https://www.harirams.in",
          "logo": "https://www.harirams.in/assets/logo/logo.webp",
          "image": "https://www.harirams.in/assets/products/HG1000_front.png",
          "telephone": phone,
          "email": email,
          "priceRange": "₹₹",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Flat B12, Sidhartha Apartment, Balakrishnan Street, West Mambalam",
            "addressLocality": "Chennai",
            "addressRegion": "Tamil Nadu",
            "postalCode": "600033",
            "addressCountry": "IN"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("contact-jsonld");
      if (existing) existing.remove();
    };
  }, [phone, email]);

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} className="py-6 lg:py-12 overflow-hidden">
      <div className="container-brand max-w-6xl mx-auto px-4 sm:px-6">

        {/* 1. CINEMATIC HERO SECTION */}
        <section className="relative rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#EADFC7] shadow-sm mb-12 overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-[#FFF6E6] to-[#FFF9F0]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 text-center lg:text-left">
              <ScrollReveal direction="up" distance={15}>
                {/* Brand Badge */}
                <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/90 border border-[#D4AF37]/50 shadow-2xs mb-4">
                  <img
                    src="/assets/logo/logo.webp"
                    alt="Hariram's Crest"
                    className="w-9 h-9 object-contain rounded-full bg-amber-50"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-900 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      HARIRAM HOME NEEDS
                    </div>
                    <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                      Customer Care & Orders • West Mambalam, Chennai
                    </div>
                  </div>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-stone-950 mb-4 leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
                >
                  We Are Always Here For You
                </h1>

                <p
                  className="text-base sm:text-lg text-stone-700 leading-relaxed mb-6 font-normal max-w-2xl"
                  style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                >
                  Have a question about your order, need pure cow ghee for a sacred family pooja or wedding, or want to connect directly with our team? Reach out via phone, WhatsApp, email, or visit us in Chennai.
                </p>

                {/* Quick Trust Highlights */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-stone-700" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-900/10 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Quick Response within 2 Hours</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-900/10 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Direct WhatsApp & Call Support</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-900/10 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Safe Glass Bottle Packing</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Hariram's Bottle Graphic */}
            <div className="lg:col-span-4 flex justify-center">
              <ScrollReveal direction="scale" distance={15} delay={100}>
                <div className="relative p-6 rounded-3xl bg-white/80 border border-[#D4AF37]/50 shadow-md text-center max-w-xs backdrop-blur-xs">
                  <img
                    src="/assets/products/HG1000_front.png"
                    alt="Hariram's 1000ml Pure Cow Ghee Jar"
                    className="h-44 sm:h-52 object-contain mx-auto drop-shadow-md hover:scale-105 transition-transform duration-300"
                  />
                  <div className="text-xs font-bold text-amber-900 mt-3 uppercase tracking-wider" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                    100% Pure Cow Ghee
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Direct from Chennai to your doorstep
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 2. DIRECT CONNECT CHANNELS (CARDS WITH DIRECT REDIRECTS - NO INQUIRY FORMS) */}
        <section className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="gold-ornament mb-2" />
            <h2
              className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
            >
              Direct Contact Channels
            </h2>
            <p className="text-xs sm:text-sm text-stone-600" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              Click any option below to connect with us instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
            
            {/* 1. WhatsApp Support */}
            <ScrollReveal direction="up" distance={20} staggerIndex={0} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white border border-[#EADFC7] shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
                    Fastest Response
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    WhatsApp Concierge
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    Instant chat for order status, quick repeat orders, bulk pooja queries, or doorstep delivery updates.
                  </p>
                  <div className="text-sm font-bold text-emerald-700 mb-4">
                    {phone}
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </ScrollReveal>

            {/* 2. Direct Phone Call */}
            <ScrollReveal direction="up" distance={20} staggerIndex={1} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white border border-[#EADFC7] shadow-xs hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wider mb-2">
                    Direct Family Support
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Customer Care Call
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">
                    Speak directly with our team. No robotic automated IVR menus.
                  </p>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{hours}</span>
                  </div>
                  <div className="text-sm font-bold text-amber-900 mb-4">
                    {phone}
                  </div>
                </div>

                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
              </div>
            </ScrollReveal>

            {/* 3. Official Email */}
            <ScrollReveal direction="up" distance={20} staggerIndex={2} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white border border-[#EADFC7] shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 uppercase tracking-wider mb-2">
                    Formal Inquiries
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Official Email
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    For corporate gifting, wholesale supply, feedback, and invoice assistance.
                  </p>
                  <div className="text-xs font-bold text-stone-800 break-all mb-4">
                    {email}
                  </div>
                </div>

                <a
                  href={`mailto:${email}?subject=Inquiry%20regarding%20Hariram%27s%20Pure%20Cow%20Ghee`}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </a>
              </div>
            </ScrollReveal>

            {/* 4. West Mambalam Location & Google Maps */}
            <ScrollReveal direction="up" distance={20} staggerIndex={3} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white border border-[#EADFC7] shadow-xs hover:border-rose-500 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 uppercase tracking-wider mb-2">
                    Chennai Headquarters
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Registered Address
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    Flat B12, Sidhartha Apartment, Balakrishnan St, West Mambalam, Chennai - 600033.
                  </p>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Maps</span>
                </a>
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* 3. BULK & TEMPLE ORDERS BANNER (FOR POOJAS, WEDDINGS, EVENTS) */}
        <section className="mb-14">
          <ScrollReveal direction="up" distance={20}>
            <div className="rounded-3xl p-6 sm:p-10 border border-[#EADFC7] shadow-sm bg-gradient-to-br from-[#FFFDF9] via-[#FFF9EE] to-[#FFF3DF] relative overflow-hidden" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Special Events & Temple Poojas</span>
                  </div>

                  <h3
                    className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--brand-primary)" }}
                  >
                    Planning a Wedding, Grihapravesam, or Temple Function?
                  </h3>

                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-6">
                    We supply 100% pure cow ghee in bulk volumes (500ml, 1L, or custom batch packaging) for auspicious occasions across Tamil Nadu and India. Enjoy special bulk rates, personalized dispatch support, and guaranteed fresh batches.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hello Hariram's, I am interested in placing a Bulk / Temple Pooja order for pure cow ghee.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp for Bulk Rates</span>
                    </a>

                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-amber-50/70 border border-amber-900/20 text-stone-800 font-semibold text-xs uppercase tracking-wider transition-all"
                    >
                      <span>Explore Shop Packs</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-4 flex justify-center">
                  <div className="p-4 rounded-2xl bg-white/90 border border-amber-200 shadow-sm text-center max-w-xs">
                    <div className="text-2xl font-serif font-bold text-amber-800 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      100% Sattvic
                    </div>
                    <div className="text-xs font-semibold text-stone-800 mb-2">
                      Trusted for Deepams & Homas
                    </div>
                    <div className="text-[11px] text-stone-600 leading-relaxed">
                      Zero animal tallow, zero chemical perfumes. Pure cow ghee suitable for sacred rituals and prasadam.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 4. BUSINESS & ECOMMERCE TRUST ASSURANCES */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center sm:text-left" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
            <div className="p-5 rounded-2xl bg-white border border-[#EADFC7] shadow-2xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Pan-India Express Delivery</div>
                <div className="text-[11px] text-stone-600 mt-0.5">Reliable doorstep courier dispatch with SMS and WhatsApp tracking.</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EADFC7] shadow-2xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Heavy-Gauge Glass Packing</div>
                <div className="text-[11px] text-stone-600 mt-0.5">Triple-cushioned bubble wrap for 100% transit breakage protection.</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EADFC7] shadow-2xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Direct Family Guarantee</div>
                <div className="text-[11px] text-stone-600 mt-0.5">If you ever have an issue with your delivery, we replace or resolve it immediately.</div>
              </div>
            </div>
          </div>
        </section>

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
