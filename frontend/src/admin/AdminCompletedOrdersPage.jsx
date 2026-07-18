import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, FileText, RefreshCw, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";

const iso = (d) => d.toISOString().slice(0, 10);
const today = () => iso(new Date());
const thirtyAgo = () => iso(new Date(Date.now() - 30 * 24 * 3600 * 1000));

export default function AdminCompletedOrdersPage() {
  const { client, token, API } = useAdminAuth();
  const [from, setFrom] = useState(thirtyAgo());
  const [to, setTo] = useState(today());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const fromIso = `${from}T00:00:00+00:00`;
      const toIso = `${to}T23:59:59+00:00`;
      const r = await client.get(
        `/admin/orders/completed?from_date=${encodeURIComponent(fromIso)}&to_date=${encodeURIComponent(toIso)}`
      );
      setOrders(r.data.orders || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Load failed");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const downloadExport = async (kind /* 'xlsx' | 'pdf' */) => {
    const fromIso = `${from}T00:00:00+00:00`;
    const toIso = `${to}T23:59:59+00:00`;
    try {
      const r = await fetch(
        `${API}/admin/orders/completed/export.${kind}?from_date=${encodeURIComponent(fromIso)}&to_date=${encodeURIComponent(toIso)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `completed_orders.${kind}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error(e.message); }
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalShipping = orders.reduce((s, o) => s + Number(o.shipping || 0), 0);

  return (
    <div data-testid={ADMIN_TID.completedPage}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl mb-1">Completed Orders</h1>
          <p className="text-sm text-[color:#6B5A46]">All orders in a date range (default: last 30 days).</p>
        </div>
      </div>

      <div className="admin-card mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[color:#6B5A46]">From</span>
          <input data-testid={ADMIN_TID.completedFrom}
                 type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                 className="admin-input" style={{ width: 170 }} />
        </label>
        <label className="text-sm">
          <span className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[color:#6B5A46]">To</span>
          <input data-testid={ADMIN_TID.completedTo}
                 type="date" value={to} onChange={(e) => setTo(e.target.value)}
                 className="admin-input" style={{ width: 170 }} />
        </label>
        <button data-testid={ADMIN_TID.completedApply}
                onClick={load} className="admin-btn admin-btn-primary">
          <RefreshCw className="w-4 h-4" /> Apply
        </button>
        <div className="ml-auto flex flex-wrap gap-2">
          <button data-testid={ADMIN_TID.completedExportXlsx}
                  onClick={() => downloadExport("xlsx")}
                  disabled={orders.length === 0}
                  className="admin-btn admin-btn-accent">
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button data-testid={ADMIN_TID.completedExportPdf}
                  onClick={() => downloadExport("pdf")}
                  disabled={orders.length === 0}
                  className="admin-btn admin-btn-ghost">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Orders" value={orders.length} />
        <Stat label="Revenue" value={`₹${Math.round(totalRevenue).toLocaleString("en-IN")}`} />
        <Stat label="Shipping" value={`₹${Math.round(totalShipping).toLocaleString("en-IN")}`} />
      </div>

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <div className="py-10 text-center text-[color:#6B5A46]">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading…
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>City</th>
                <th className="text-right">Shipping</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderNumber} data-testid={ADMIN_TID.completedRow(o.orderNumber)}>
                  <td className="font-mono font-bold">{o.orderNumber}</td>
                  <td className="whitespace-nowrap text-[color:#6B5A46]">
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <span className={`admin-badge ${o.status === "SHIPPED" ? "badge-shipped" : "badge-paid"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="font-semibold">{o.address?.name}</td>
                  <td>+91 {o.phone}</td>
                  <td>{o.address?.city}</td>
                  <td className="text-right">₹{o.shipping}</td>
                  <td className="text-right font-semibold">₹{o.total}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-[color:#6B5A46]">No orders in the selected range.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="admin-card">
      <div className="text-[11px] uppercase tracking-wider text-[color:#6B5A46]">{label}</div>
      <div className="text-2xl font-extrabold" style={{ color: "#174C2B", fontFamily: "'Playfair Display', serif" }}>
        {value}
      </div>
    </div>
  );
}
