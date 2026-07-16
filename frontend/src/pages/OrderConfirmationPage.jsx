import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Package, Truck, Home as HomeIcon } from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (order) return;
    apiClient
      .get(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch((e) => setError(e.response?.data?.detail || "Order not found"));
  }, [id, order]);

  if (error) {
    return (
      <div className="container-brand py-20 text-center">
        <h1 className="text-3xl mb-4">{error}</h1>
        <Link to="/" className="btn-primary inline-flex">
          <HomeIcon className="w-4 h-4" /> Home
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-brand py-20 text-center" style={{ color: "var(--brand-muted)" }}>
        Loading order…
      </div>
    );
  }

  const eta = new Date(Date.now() + 4 * 24 * 3600 * 1000).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div data-testid={TESTIDS.confirmation} style={{ background: "var(--brand-cream)", minHeight: "100vh" }}>
      <div className="container-brand py-14 lg:py-20">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: "var(--brand-primary)" }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl mb-3">Thank you, {order.name}!</h1>
          <p className="text-lg" style={{ color: "var(--brand-text)" }}>
            Your order has been placed successfully. We'll pack it with care and ship it soon.
          </p>
        </div>

        <div
          className="max-w-3xl mx-auto rounded-2xl border p-6 lg:p-8"
          style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 mb-5 border-b" style={{ borderColor: "var(--brand-border)" }}>
            <div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--brand-muted)" }}>
                Order Number
              </div>
              <div data-testid={TESTIDS.confirmationOrder} className="text-2xl font-extrabold"
                   style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}>
                {order.orderNumber}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--brand-muted)" }}>
                Estimated Delivery
              </div>
              <div className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>
                <Truck className="w-4 h-4 inline mr-2" />{eta}
              </div>
            </div>
          </div>

          <ul className="space-y-3 mb-5">
            {order.items.map((it) => (
              <li key={it.sku} className="flex items-center gap-3">
                {it.image && <img src={it.image} alt="" className="bottle-img w-14 h-16 object-contain rounded-lg bg-[color:var(--brand-cream)]" />}
                <div className="flex-1">
                  <div className="font-semibold" style={{ color: "var(--brand-primary)" }}>{it.name}</div>
                  <div className="text-sm" style={{ color: "var(--brand-muted)" }}>{it.variant} × {it.quantity}</div>
                </div>
                <div className="font-semibold" style={{ color: "var(--brand-text)" }}>
                  {formatINR(it.price * it.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t space-y-2" style={{ borderColor: "var(--brand-border)" }}>
            <Row l="Subtotal" v={formatINR(order.subtotal)} />
            <Row l="Shipping" v={order.shipping === 0 ? "FREE" : formatINR(order.shipping)} />
            <div className="flex justify-between pt-3 mt-1 border-t items-baseline" style={{ borderColor: "var(--brand-border)" }}>
              <span className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>Amount Paid</span>
              <span className="text-3xl font-extrabold" style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}>
                {formatINR(order.total)}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--brand-border)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--brand-muted)" }}>
              Delivering to
            </div>
            <div className="text-sm" style={{ color: "var(--brand-text)" }}>
              <strong>{order.address.name}</strong><br />
              {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
              {order.address.landmark && <>Near {order.address.landmark}<br /></>}
              {order.address.city}, {order.address.state} — {order.address.pincode}<br />
              +91-{order.phone}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" data-testid={TESTIDS.confirmationContinue} className="btn-primary inline-flex">
              <Package className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ l, v }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--brand-text)" }}>{l}</span>
      <span className="font-semibold" style={{ color: "var(--brand-text)" }}>{v}</span>
    </div>
  );
}
