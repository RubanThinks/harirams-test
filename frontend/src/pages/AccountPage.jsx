import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package, User, MapPin, Phone as PhoneIcon, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAccount } from "@/context/AccountContext";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";

export default function AccountPage() {
  const { phone, logout, isAuthed } = useAccount();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if not authed (unless we're intentionally logging out and heading home)
  useEffect(() => {
    if (!isAuthed && !loggingOut) navigate("/account/login", { replace: true });
  }, [isAuthed, loggingOut, navigate]);

  useEffect(() => {
    if (!phone) return;
    let alive = true;
    Promise.all([
      apiClient.get(`/customers/${phone}/profile`),
      apiClient.get(`/customers/${phone}/orders`),
    ])
      .then(([p, o]) => {
        if (!alive) return;
        setProfile(p.data);
        setOrders(o.data.orders || []);
      })
      .catch((e) => {
        if (!alive) return;
        if (e.response?.status === 401) {
          logout();
          return;
        }
        setError(e.response?.data?.detail || "Could not load account");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [phone, logout]);

  const doLogout = () => {
    setLoggingOut(true);
    logout();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  if (!isAuthed) return null;

  return (
    <div data-testid={TESTIDS.accountPage} style={{ background: "var(--brand-cream)", minHeight: "100vh" }}>
      <div className="container-brand py-10 lg:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="gold-ornament" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl mt-1" style={{ color: "var(--brand-primary)" }}>
              My Account
            </h1>
          </div>
          <button
            data-testid={TESTIDS.accountLogout}
            onClick={doLogout}
            className="btn-ghost !py-2 self-start"
          >
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </button>
        </div>

        {loading && (
          <div className="text-center py-14" style={{ color: "var(--brand-muted)" }}>
            <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Loading your account…
          </div>
        )}
        {error && (
          <div className="text-center py-14" style={{ color: "var(--brand-accent)" }}>{error}</div>
        )}

        {!loading && !error && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Profile */}
            <aside
              data-testid={TESTIDS.accountProfile}
              className="rounded-2xl border p-6 lg:p-7 h-fit"
              style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                     style={{ background: "var(--brand-primary)" }}>
                  {(profile.name || "H").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
                    {profile.name || "Welcome"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--brand-muted)" }}>
                    Customer since your first order
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <Field icon={PhoneIcon} label="Mobile">
                  +91-{profile.phone}
                </Field>
                {profile.address && (
                  <Field icon={MapPin} label="Delivery Address">
                    <div className="leading-relaxed" style={{ color: "var(--brand-text)" }}>
                      {profile.address.line1}
                      {profile.address.line2 ? `, ${profile.address.line2}` : ""}<br />
                      {profile.address.landmark && <>Near {profile.address.landmark}<br /></>}
                      {profile.address.city}, {profile.address.state} — {profile.address.pincode}
                    </div>
                  </Field>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 pt-5 border-t"
                   style={{ borderColor: "var(--brand-border)" }}>
                <Stat label="Orders" value={profile.totalOrders} />
                <Stat label="Total Spent" value={formatINR(profile.totalSpent)} isPrice />
              </div>
            </aside>

            {/* Right — Orders with Liquid Frosted Glass */}
            <section
              data-testid={TESTIDS.accountOrders}
              className="lg:col-span-2 rounded-2xl liquid-glass border border-white/70 p-6 lg:p-7 shadow-sm"
            >
              <h2 className="text-2xl mb-1" style={{ color: "var(--brand-primary)" }}>Order History</h2>
              <p className="text-sm mb-5" style={{ color: "var(--brand-muted)" }}>
                All your orders with Hariram's — most recent first.
              </p>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--brand-secondary)" }} />
                  <p className="text-sm mb-3" style={{ color: "var(--brand-muted)" }}>No orders yet.</p>
                  <Link to="/" className="btn-primary inline-flex">Shop Now</Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {orders.map((o) => (
                    <li key={o.orderNumber} data-testid={TESTIDS.accountOrder(o.orderNumber)}>
                      <Link
                        to={`/order/${o.orderNumber}`}
                        data-testid={TESTIDS.accountOrderView(o.orderNumber)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/70 liquid-glass-pill hover:border-[color:var(--brand-primary)] hover:shadow-md transition-all"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                             style={{ background: "var(--brand-cream)" }}>
                          <Package className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-bold text-sm sm:text-base font-price"
                                  style={{ color: "var(--brand-primary)" }}>{o.orderNumber}</span>
                            <span className="text-xs" style={{ color: "var(--brand-muted)" }}>
                              {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <StatusPill status={o.status} paymentStatus={o.paymentStatus} />
                          </div>
                          <div className="text-xs mt-1 truncate" style={{ color: "var(--brand-text)" }}>
                            {(o.items || []).map((i) => `${i.name} ${i.variant} × ${i.quantity}`).join(", ")}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold font-price" style={{ color: "var(--brand-primary)" }}>{formatINR(o.total)}</div>
                          <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--brand-muted)" }}>
                            View details <ChevronRight className="w-3 h-3 inline" />
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--brand-cream)" }}>
        <Icon className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider mb-0.5"
             style={{ color: "var(--brand-muted)" }}>{label}</div>
        <div style={{ color: "var(--brand-text)" }}>{children}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, isPrice = false }) {
  return (
    <div className="p-2.5 rounded-xl bg-white/40 border border-amber-900/10">
      <div className="text-[11px] uppercase tracking-wider mb-1"
           style={{ color: "var(--brand-muted)" }}>{label}</div>
      <div className={`text-lg font-bold ${isPrice ? "font-price text-emerald-900" : ""}`}
           style={{ color: "var(--brand-primary)", fontFamily: isPrice ? "'Poppins', sans-serif" : "'Playfair Display', serif" }}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status, paymentStatus }) {
  const isPaid = paymentStatus === "PAID";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
      style={{
        background: isPaid ? "rgba(23,76,43,0.10)" : "rgba(217,63,63,0.12)",
        color: isPaid ? "var(--brand-primary)" : "var(--brand-accent)",
      }}
    >
      {status}
    </span>
  );
}
