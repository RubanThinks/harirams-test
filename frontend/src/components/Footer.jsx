import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Phone, Mail, Heart } from "lucide-react";
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
    <footer data-testid={TESTIDS.footer} className="w-full" style={{ background: "var(--brand-cream)" }}>
      <div className="container-brand py-6 lg:py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-5">
        {/* Brand column */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <img src="/assets/logo/logo.webp" alt="Hariram's HHN Logo" className="h-16 w-20 object-contain rounded-lg" />
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--brand-accent)", fontFamily: "'Playfair Display', serif" }}>
              {company.brandName}
            </div>
            <span className="gold-ornament mt-1">
              <span className="tagline-italic">{company.tagline}</span>
            </span>
          </div>
          <p className="mt-5 text-sm lg:text-base leading-relaxed" style={{ color: "var(--brand-text)" }}>
            {footer.brandLine || company.footerBrandLine}
          </p>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--brand-muted)" }}>
              Follow Us
            </div>
            <div className="flex gap-3">
              {social?.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full flex items-center justify-center text-white transition"
                   style={{ background: "var(--brand-accent)" }} aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social?.whatsapp && (
                <a href={social.whatsapp} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                   style={{ background: "var(--brand-accent)" }} aria-label="WhatsApp">
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              )}
              {social?.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                   style={{ background: "var(--brand-accent)" }} aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social?.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                   style={{ background: "var(--brand-accent)" }} aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Column: Quick Links */}
        <FooterColumn title="Quick Links" links={footer.quickLinks} />
        {/* Column: Customer Care */}
        <FooterColumn title="Customer Care" links={footer.customerCare} />
        {/* Column: My Account */}
        <FooterColumn title="My Account" links={footer.myAccount} />

        {/* Newsletter + support */}
        <div>
          <h4 className="text-xl lg:text-2xl mb-1" style={{ color: "var(--brand-primary)" }}>
            {footer.newsletter?.heading || "Stay Connected"}
          </h4>
          <span className="gold-ornament" />
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--brand-text)" }}>
            {footer.newsletter?.subheading}
          </p>
          <form onSubmit={subscribe} className="mt-4 flex items-center gap-2 max-w-full">
            <div className="flex-1 min-w-0 flex items-center rounded-full border pl-3 pr-2 py-0.5 bg-white"
                 style={{ borderColor: "var(--brand-border)" }}>
              <input
                data-testid={TESTIDS.newsletterEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                aria-label="Email address"
                placeholder={footer.newsletter?.placeholder || "Enter your email"}
                className="flex-1 min-w-0 bg-transparent outline-none text-xs py-1.5"
              />
              <Heart className="w-3.5 h-3.5" style={{ color: "var(--brand-accent)" }} />
            </div>
            <button
              data-testid={TESTIDS.newsletterSubmit}
              type="submit"
              disabled={busy}
              className="btn-primary !py-2 !px-3 text-[11px] shrink-0"
            >
              {busy ? "..." : (footer.newsletter?.cta || "SUBSCRIBE")}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--brand-border)" }}>
            <h5 className="text-lg" style={{ color: "var(--brand-primary)" }}>
              {footer.supportHeading || "Need Help? We're Here!"}
            </h5>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FCE9C9" }}>
                  <Phone className="w-4 h-4" style={{ color: "var(--brand-accent)" }} />
                </span>
                <div>
                  <div className="font-semibold" style={{ color: "var(--brand-text)" }}>{company.customerCare}</div>
                  <div className="text-xs" style={{ color: "var(--brand-muted)" }}>{company.customerCareHours}</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FCE9C9" }}>
                  <Mail className="w-4 h-4" style={{ color: "var(--brand-accent)" }} />
                </span>
                <a href={`mailto:${company.email}`} className="font-semibold hover:underline" style={{ color: "var(--brand-text)" }}>
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance strip */}
      <div className="container-brand pb-4 flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: "var(--brand-muted)" }}>
        <span>FSSAI: {company.fssaiNumber}</span>
        <span>•</span>
        <span>GST: {company.gstNumber}</span>
        <span>•</span>
        <span>{company.legalCompanyName}</span>
      </div>

      {/* Red kolam copyright bar */}
      <div className="copyright-bar py-4">
        <div className="container-brand flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-sm">
          <span aria-hidden style={{ color: "var(--brand-secondary)" }}>❋</span>
          <span>© {footer.copyrightYear || new Date().getFullYear()} {company.brandName}. All Rights Reserved.</span>
          <span aria-hidden className="hidden md:inline">|</span>
          <span className="inline-flex items-center gap-2">
            {footer.copyrightSuffix?.split("♥")[0] || "Made with "}
            <Heart className="w-4 h-4 inline" fill="currentColor" style={{ color: "var(--brand-secondary)" }} />
            {footer.copyrightSuffix?.split("♥")[1] || " for your family."}
          </span>
          <span aria-hidden style={{ color: "var(--brand-secondary)" }}>❋</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links = [] }) {
  return (
    <div>
      <h4 className="text-xl lg:text-2xl mb-1" style={{ color: "var(--brand-primary)" }}>{title}</h4>
      <span className="gold-ornament" />
      <ul className="mt-4 space-y-3">
        {links.map((l) => {
          const isExternal = /^https?:\/\//.test(l.url || "");
          const cls = "text-sm lg:text-[15px] hover:text-[color:var(--brand-accent)] transition-colors";
          if (isExternal) {
            return (
              <li key={l.label}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className={cls}
                   style={{ color: "var(--brand-text)" }}>{l.label}</a>
              </li>
            );
          }
          const isHash = (l.url || "").includes("#");
          if (isHash) {
            return (
              <li key={l.label}>
                <a href={l.url} className={cls} style={{ color: "var(--brand-text)" }}>{l.label}</a>
              </li>
            );
          }
          return (
            <li key={l.label}>
              <Link to={l.url} className={cls} style={{ color: "var(--brand-text)" }}>{l.label}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
