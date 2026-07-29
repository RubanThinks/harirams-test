import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { apiClient } from "@/lib/api";

/**
 * Renders a legal document (Terms, Privacy, Refunds, Shipping, Payment)
 * from /api/legal/{slug}. Slug is the manifest id (e.g. "terms_and_conditions").
 *
 * The URL route may use either the manifest route ("/terms-and-conditions")
 * or an id directly ("/legal/terms_and_conditions").
 */
const ROUTE_TO_ID = {
  "terms-and-conditions": "terms_and_conditions",
  "privacy-policy": "privacy_policy",
  "returns-refunds": "returns_refunds",
  "shipping-delivery": "shipping_and_delivery",
  "payment-policy": "payment_policy",
};

export default function LegalPage() {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  const pathSlug = (location.pathname || "").replace(/^\//, "").split("/")[0];
  const slug = paramSlug || pathSlug;
  const id = ROUTE_TO_ID[slug] || slug || "terms_and_conditions";
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    setDoc(null);
    apiClient
      .get(`/legal/${id}`)
      .then((r) => alive && setDoc(r.data))
      .catch((e) => alive && setError(e.response?.data?.detail || "Document not found"));
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (doc?.title) document.title = `${doc.title} — Hariram's Pure Cow Ghee`;
  }, [doc]);

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} data-testid={`legal-page-${id}`}>
      <div className="container-brand py-10 lg:py-14 max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:underline"
          style={{ color: "var(--brand-primary)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {error ? (
          <div className="text-center py-14" style={{ color: "var(--brand-accent)" }}>{error}</div>
        ) : !doc ? (
          <div className="text-center py-14" style={{ color: "var(--brand-muted)" }}>
            <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Loading…
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="gold-ornament mb-2" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl" style={{ color: "var(--brand-primary)" }}>
                {doc.title || "Policy"}
              </h1>
              <p className="text-sm mt-3" style={{ color: "var(--brand-muted)" }}>
                {doc.version && <>Version {doc.version} &nbsp;•&nbsp;</>}
                {doc.effectiveDate && <>Effective {doc.effectiveDate} &nbsp;•&nbsp;</>}
                {doc.lastUpdated && <>Updated {doc.lastUpdated}</>}
              </p>
            </div>

            <article
              className="rounded-2xl border p-6 lg:p-10 legal-body"
              style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
            >
              {doc.markdown ? (
                <ReactMarkdown>{doc.markdown}</ReactMarkdown>
              ) : (
                <pre className="whitespace-pre-wrap text-sm" style={{ color: "var(--brand-text)" }}>
                  {JSON.stringify(doc, null, 2)}
                </pre>
              )}
            </article>
          </>
        )}
      </div>
    </div>
  );
}
