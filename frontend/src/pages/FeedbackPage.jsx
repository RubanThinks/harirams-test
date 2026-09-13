import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", rating: 5, message: "" });
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error("Please share your feedback message.");
      return;
    }
    setBusy(true);
    try {
      await apiClient.post("/feedback", form);
      toast.success("Thank you! Your feedback has been recorded.");
      setForm({ name: "", email: "", phone: "", rating: 5, message: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not submit feedback. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => { document.title = "Feedback — Hariram's Pure Cow Ghee"; }, []);

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }} data-testid="feedback-page">
      <div className="container-brand py-8 lg:py-10 max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-semibold mb-5 hover:underline"
          style={{ color: "var(--brand-primary)" }}
          data-testid="feedback-back-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-6">
          <div className="gold-ornament mb-2" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl flex items-center justify-center gap-3" style={{ color: "var(--brand-primary)" }}>
            <MessageSquare className="w-7 h-7" /> Share Your Feedback
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--brand-muted)" }}>
            Your voice helps us serve better. All fields except message are optional.
          </p>
        </div>

        <form
          onSubmit={submit}
          data-testid="feedback-form"
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-semibold" style={{ color: "var(--brand-text)" }}>Name</span>
              <input
                data-testid="feedback-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                style={{ borderColor: "var(--brand-border)" }}
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold" style={{ color: "var(--brand-text)" }}>Email</span>
              <input
                data-testid="feedback-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                style={{ borderColor: "var(--brand-border)" }}
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold" style={{ color: "var(--brand-text)" }}>Phone</span>
              <input
                data-testid="feedback-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                style={{ borderColor: "var(--brand-border)" }}
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold" style={{ color: "var(--brand-text)" }}>Rating</span>
              <select
                data-testid="feedback-rating"
                value={form.rating}
                onChange={(e) => set("rating", parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                style={{ borderColor: "var(--brand-border)" }}
              >
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-semibold" style={{ color: "var(--brand-text)" }}>Your feedback *</span>
            <textarea
              data-testid="feedback-message"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              rows={5}
              required
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
              style={{ borderColor: "var(--brand-border)" }}
            />
          </label>
          <button
            data-testid="feedback-submit"
            type="submit"
            disabled={busy}
            className="btn-primary w-full"
          >
            {busy ? "Submitting…" : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
