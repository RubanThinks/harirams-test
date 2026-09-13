import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { apiClient } from "@/lib/api";

const ROUTE_TO_ID = {
  "why-hariram": "why_hariram",
  "recipes": "recipes",
  "faq": "faq",
  "contact": "contact",
};

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = (location.pathname || "").replace(/^\//, "").split("/")[0];
  const id = ROUTE_TO_ID[slug];
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setDoc(null);
    setError(null);
    apiClient
      .get(`/content/${id}`)
      .then((r) => alive && setDoc(r.data))
      .catch((e) => alive && setError(e.response?.data?.detail || "Page not found"));
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (doc?.title) document.title = `${doc.title} — Hariram's Pure Cow Ghee`;
  }, [doc]);

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} data-testid={`content-page-${id}`}>
      <div className="container-brand py-8 lg:py-10 max-w-3xl mx-auto">
        <button
          data-testid="content-back-btn"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-semibold mb-5 hover:underline"
          style={{ color: "var(--brand-primary)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {error ? (
          <div className="text-center py-12" style={{ color: "var(--brand-accent)" }}>{error}</div>
        ) : !doc ? (
          <div className="text-center py-12" style={{ color: "var(--brand-muted)" }}>
            <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Loading…
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="gold-ornament mb-2" />
              <h1 data-testid="content-title" className="text-3xl sm:text-4xl lg:text-5xl" style={{ color: "var(--brand-primary)" }}>
                {doc.title}
              </h1>
            </div>
            <article
              className="rounded-2xl border p-6 lg:p-8 legal-body"
              style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
            >
              <ReactMarkdown>{doc.markdown || ""}</ReactMarkdown>
            </article>
          </>
        )}
      </div>
    </div>
  );
}
