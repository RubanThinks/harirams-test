import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Phone, Mail, Heart, Check, Sparkles } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { TESTIDS } from "@/constants/testIds";

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.3 0-.4-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.6 1 2.8c.1.1 1.8 2.8 4.3 3.8 2.5 1 2.5.7 3 .6.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.1-1.3-.1-.1-.2-.2-.5-.3z"/>
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.5.8 3.2 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-3-.2-.3C4.4 15 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"/>
    </svg>
  );
}

export default function Footer() {
  const { data: company } = useConfig("company");
  const { data: footer } = useConfig("footer");
  const { data: social } = useConfig("social_links");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiClient.post("/newsletter/subscribe", { email });
      toast.success("Subscribed! Welcome to the Hariram's family.");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Please enter a valid email.");
    } finally {
      setBusy(false);
    }
  };

  if (!company || !footer) return null;

  return (
    <footer
      data-testid={TESTIDS.footer}
      className="w-full relative overflow-hidden bg-cover bg-center bg-no-repeat pt-12 sm:pt-16"
      style={{
        backgroundImage: "url('/assets/footer_pasture_bg.png')",
        backgroundAttachment: "scroll",
      }}
    >
      {/* Reduced contrast scrim overlay: lets the natural green pasture & cows photo shine through clearly */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: "linear-gradient(to bottom, rgba(22, 16, 10, 0.35) 0%, rgba(18, 14, 8, 0.48) 50%, rgba(14, 10, 6, 0.68) 100%)",
        }}
      />

      {/* Footer Content — Placed Directly on the Image (No White Box) */}
      <div className="container-brand relative z-10 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 text-stone-200">
          
          {/* Brand Column (3 cols) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo/logo.webp"
                alt="Hariram's HHN Logo"
                className="h-14 w-18 object-contain rounded-xl p-1.5 bg-stone-900/60 backdrop-blur-md border border-amber-400/30 shadow-md"
              />
            </div>

            <div className="mt-3">
              <div
                className="text-2xl lg:text-3xl font-bold tracking-tight text-[#F6C564] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {company.brandName}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="w-4 h-px bg-amber-400/80" />
                <span className="italic text-xs sm:text-sm font-medium text-amber-200 drop-shadow-sm">
                  {company.tagline}
                </span>
              </div>
            </div>

            <p
              className="mt-4 text-xs sm:text-sm leading-relaxed text-stone-300 font-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
              style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
            >
              {footer.brandLine || company.footerBrandLine}
            </p>

            {/* Social Connect */}
            <div className="mt-5">
              <div 
                className="text-[11px] uppercase tracking-wider font-semibold mb-2.5 text-amber-300/90 drop-shadow-sm" 
                style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
              >
                Follow Our Heritage
              </div>
              <div className="flex gap-2.5">
                {social?.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:scale-105 border border-white/20 bg-amber-700/80 hover:bg-amber-600"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {social?.whatsapp && (
                  <a
                    href={social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:scale-105 border border-white/20 bg-[#25D366] hover:brightness-110"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {social?.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:scale-105 border border-white/20 bg-[#1877F2] hover:brightness-110"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                )}
                {social?.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:scale-105 border border-white/20 bg-[#FF0000] hover:brightness-110"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Column: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <FooterColumn title="Quick Links" links={footer.quickLinks} />
          </div>

          {/* Column: Customer Care (2 cols) */}
          <div className="lg:col-span-2">
            <FooterColumn title="Customer Care" links={footer.customerCare} />
          </div>

          {/* Column: My Account (2 cols) */}
          <div className="lg:col-span-2">
            <FooterColumn title="My Account" links={footer.myAccount} />
          </div>

          {/* Newsletter + Support Info (3 cols) */}
          <div className="lg:col-span-3">
            <h4
              className="text-lg lg:text-xl font-bold mb-1 text-[#F6C564] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {footer.newsletter?.heading || "Stay Connected"}
            </h4>
            <div className="w-8 h-0.5 bg-amber-400 mb-2.5 rounded-full" />

            <p
              className="text-xs leading-relaxed text-stone-300 font-normal drop-shadow-sm mb-3"
              style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
            >
              {footer.newsletter?.subheading || "Subscribe for wellness insights, festive offers, and Vedic recipes."}
            </p>

            {/* Newsletter Input Form: full width stacked for complete placeholder visibility */}
            <form onSubmit={subscribe} className="space-y-2.5 max-w-full">
              <div className="w-full flex items-center gap-2.5 rounded-xl border border-amber-400/40 px-3.5 py-2.5 bg-stone-950/70 backdrop-blur-md shadow-inner focus-within:border-amber-300 focus-within:ring-1 focus-within:ring-amber-300/40 transition-all">
                <Mail className="w-4 h-4 shrink-0 text-amber-300" />
                <input
                  data-testid={TESTIDS.newsletterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  aria-label="Email address"
                  placeholder={footer.newsletter?.placeholder || "Enter your email"}
                  className="w-full min-w-0 bg-transparent outline-none text-xs text-stone-100 placeholder:text-stone-300 font-medium"
                  style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
                />
              </div>
              <button
                data-testid={TESTIDS.newsletterSubmit}
                type="submit"
                disabled={busy}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
              >
                {busy ? "..." : (footer.newsletter?.cta || "SUBSCRIBE")}
              </button>
            </form>

            {/* Support Contact */}
            <div className="mt-6 pt-5 border-t border-white/15">
              <h5
                className="text-base font-serif font-bold mb-2.5 text-[#F6C564] drop-shadow-sm"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {footer.supportHeading || "Need Help? We're Here!"}
              </h5>

              <ul className="space-y-2.5 text-xs" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-amber-400/20 border border-amber-400/40 text-amber-300">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-semibold text-stone-100 drop-shadow-xs">{company.customerCare}</div>
                    <div className="text-[10.5px] text-amber-200/80">{company.customerCareHours}</div>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-amber-400/20 border border-amber-400/40 text-amber-300 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={`mailto:${company.email}`}
                      className="font-medium text-stone-200 hover:text-amber-300 hover:underline break-all text-xs drop-shadow-xs leading-snug block"
                      title={company.email}
                    >
                      {company.email}
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Compliance Strip directly on photo */}
        <div
          className="mt-8 pt-5 border-t border-white/15 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-400 drop-shadow-sm"
          style={{ fontFamily: "'Poppins', Arial, sans-serif" }}
        >
          <span className="font-medium">FSSAI: {company.fssaiNumber}</span>
          <span className="text-amber-400/50">•</span>
          <span className="font-medium">GSTIN: {company.gstNumber}</span>
          <span className="text-amber-400/50">•</span>
          <span className="font-medium">{company.legalCompanyName}</span>
        </div>
      </div>

      {/* Deep Temple Green Grounding Copyright Bar */}
      <div
        className="py-4 border-t border-amber-900/10 backdrop-blur-md"
        style={{
          background: "rgba(23, 76, 43, 0.94)",
          fontFamily: "'Poppins', Arial, sans-serif",
        }}
      >
        <div className="container-brand flex flex-col md:flex-row items-center justify-center gap-2.5 md:gap-6 text-xs text-amber-100">
          <span aria-hidden className="text-amber-300">❋</span>
          <span>© {footer.copyrightYear || new Date().getFullYear()} {company.brandName}. All Rights Reserved.</span>
          <span aria-hidden className="hidden md:inline text-amber-400/50">|</span>
          <span className="inline-flex items-center gap-1.5 text-amber-200">
            {footer.copyrightSuffix?.split("♥")[0] || "Made with "}
            <Heart className="w-3.5 h-3.5 inline text-amber-400 fill-amber-400" />
            {footer.copyrightSuffix?.split("♥")[1] || " for your family."}
          </span>
          <span aria-hidden className="text-amber-300">❋</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links = [] }) {
  return (
    <div>
      <h4
        className="text-lg lg:text-xl font-bold mb-1 text-[#F6C564] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h4>
      <div className="w-8 h-0.5 bg-amber-400 mb-2.5 rounded-full" />
      <ul className="mt-3 space-y-2.5" style={{ fontFamily: "'Poppins', Arial, sans-serif" }}>
        {links.map((l) => {
          const isExternal = /^https?:\/\//.test(l.url || "");
          const cls = "text-xs lg:text-[13.5px] text-stone-300 hover:text-amber-300 transition-colors drop-shadow-xs font-normal";
          if (isExternal) {
            return (
              <li key={l.label}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className={cls}>
                  {l.label}
                </a>
              </li>
            );
          }
          const isHash = (l.url || "").includes("#");
          if (isHash) {
            return (
              <li key={l.label}>
                <a href={l.url} className={cls}>
                  {l.label}
                </a>
              </li>
            );
          }
          return (
            <li key={l.label}>
              <Link to={l.url} className={cls}>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
