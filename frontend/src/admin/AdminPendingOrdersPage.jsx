import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Printer, FileText, Truck, MailOpen, ArrowUp, ArrowDown, Loader2, RefreshCw
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";

const SORT_FIELDS = [
  { key: "created_at", label: "Order Date" },
  { key: "city", label: "City" },
  { key: "totalQuantity", label: "Total Items" },
  { key: "total", label: "Total Price" },
  { key: "orderNumber", label: "Order #" },
];

export default function AdminPendingOrdersPage() {
  const { client, token, API } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [sort, setSort] = useState("created_at");
  const [direction, setDirection] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // orderNumber -> bool
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await client.get(`/admin/orders/pending?sort=${sort}&direction=${direction}`);
      setOrders(r.data.orders || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Load failed");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [sort, direction]); // eslint-disable-line

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );
  const allChecked = orders.length > 0 && selectedIds.length === orders.length;

  const toggleAll = () => {
    if (allChecked) setSelected({});
    else setSelected(Object.fromEntries(orders.map((o) => [o.orderNumber, true])));
  };

  const toggle = (n) => setSelected((s) => ({ ...s, [n]: !s[n] }));

  const downloadBlob = async (path, body, filename) => {
    const r = await fetch(`${API}${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j.detail || `HTTP ${r.status}`);
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const printPendingList = async () => {
    setBusy(true);
    try {
      await downloadBlob(`/admin/orders/print-pending-pdf?sort=${sort}&direction=${direction}`, null, "pending_orders.pdf");
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const printAddresses = async (orderNumbers) => {
    if (!orderNumbers.length) { toast.info("Select at least one order"); return; }
    setBusy(true);
    try {
      await downloadBlob("/admin/orders/print-address", { orderNumbers }, `addresses_${orderNumbers.length}.pdf`);
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const markShipped = async () => {
    const ids = selectedIds;
    if (!ids.length) { toast.info("Select at least one order"); return; }
    if (!window.confirm(`Mark ${ids.length} order(s) as SHIPPED?`)) return;
    setBusy(true);
    try {
      const r = await client.post("/admin/orders/mark-shipped", { orderNumbers: ids });
      toast.success(`${r.data.shipped} order(s) marked shipped`);
      setSelected({});
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  const sendInvoice = async (orderNumber) => {
    try {
      const r = await client.post(`/admin/orders/${orderNumber}/send-invoice`);
      toast.success(`Invoice queued for ${orderNumber}`, {
        description: "PDF stored. Delivery via WhatsApp/SMS activates at Twilio go-live.",
      });
      // Open the PDF in a new tab so seller can also print/share now
      const w = window.open(`${API}/admin/orders/${orderNumber}/invoice.pdf`, "_blank");
      // The invoice endpoint needs the token — provide via fetch instead
      if (w) w.close();
      const inv = await fetch(`${API}${r.data.invoiceUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await inv.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  return (
    <div data-testid={ADMIN_TID.pendingPage}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl mb-1">Pending Orders</h1>
          <p className="text-sm text-[color:#6B5A46]">Orders paid but not yet shipped.</p>
        </div>
        <button onClick={load} className="admin-btn admin-btn-ghost">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="admin-card mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[color:#6B5A46]">Sort by</span>
          <select data-testid={ADMIN_TID.pendingSortField}
                  value={sort} onChange={(e) => setSort(e.target.value)}
                  className="admin-select" style={{ width: 160 }}>
            {SORT_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </label>
        <button data-testid={ADMIN_TID.pendingSortDirection}
                onClick={() => setDirection((d) => d === "asc" ? "desc" : "asc")}
                className="admin-btn admin-btn-ghost">
          {direction === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {direction === "asc" ? "Ascending" : "Descending"}
        </button>

        <div className="ml-auto flex flex-wrap gap-2">
          <button data-testid={ADMIN_TID.pendingPrintAll}
                  onClick={printPendingList}
                  disabled={busy}
                  className="admin-btn admin-btn-primary">
            <Printer className="w-4 h-4" /> Print All Pending (PDF)
          </button>
          <button data-testid={ADMIN_TID.pendingPrintAddresses}
                  onClick={() => printAddresses(selectedIds)}
                  disabled={busy || selectedIds.length === 0}
                  className="admin-btn admin-btn-accent"
                  title={selectedIds.length === 0
                    ? "Select at least one order to print address stickers"
                    : `Generate ${selectedIds.length <= 3 ? "A5" : selectedIds.length <= 6 ? "A4" : "A4 + A5"} sticker PDF`}>
            <FileText className="w-4 h-4" /> Print Address ({selectedIds.length})
          </button>
          <button data-testid={ADMIN_TID.pendingMarkShipped}
                  onClick={markShipped}
                  disabled={busy || selectedIds.length === 0}
                  className="admin-btn admin-btn-primary">
            <Truck className="w-4 h-4" /> Mark Shipped ({selectedIds.length})
          </button>
        </div>
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
                <th style={{ width: 36 }}>
                  <input data-testid={ADMIN_TID.pendingSelectAll}
                         type="checkbox" checked={allChecked} onChange={toggleAll}
                         aria-label="Select all" />
                </th>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>City</th>
                <th>Items</th>
                <th className="text-right">Shipping</th>
                <th className="text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const totalQty = (o.items || []).reduce((s, i) => s + i.quantity, 0);
                return (
                  <tr key={o.orderNumber} data-testid={ADMIN_TID.pendingRow(o.orderNumber)}>
                    <td>
                      <input data-testid={ADMIN_TID.pendingCheckbox(o.orderNumber)}
                             type="checkbox" checked={!!selected[o.orderNumber]}
                             onChange={() => toggle(o.orderNumber)}
                             aria-label={`Select ${o.orderNumber}`} />
                    </td>
                    <td>
                      <div className="font-mono font-bold text-[color:#174C2B]">{o.orderNumber}</div>
                      <span className="admin-badge badge-paid">{o.paymentStatus}</span>
                    </td>
                    <td className="whitespace-nowrap text-[color:#6B5A46]">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      <div className="text-[11px]">
                        {new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="font-semibold">{o.address?.name}</td>
                    <td className="whitespace-nowrap">+91 {o.phone}</td>
                    <td>{o.address?.city}</td>
                    <td>
                      <ul className="space-y-0.5">
                        {(o.items || []).map((i, k) => (
                          <li key={k} className="text-[12px]">
                            <span className="font-mono text-[11px] text-[color:#6B5A46] mr-1">×{i.quantity}</span>
                            {i.name} {i.variant}
                          </li>
                        ))}
                      </ul>
                      <div className="text-[11px] text-[color:#6B5A46] mt-1">Qty {totalQty}</div>
                    </td>
                    <td className="text-right whitespace-nowrap">₹{o.shipping}</td>
                    <td className="text-right whitespace-nowrap font-semibold">₹{o.total}</td>
                    <td className="text-right whitespace-nowrap">
                      <button data-testid={ADMIN_TID.printSingleAddress(o.orderNumber)}
                              onClick={() => printAddresses([o.orderNumber])}
                              className="admin-btn admin-btn-ghost admin-btn-sm mr-1"
                              title="Print address slip">
                        <FileText className="w-3.5 h-3.5" /> Address
                      </button>
                      <button data-testid={ADMIN_TID.sendInvoice(o.orderNumber)}
                              onClick={() => sendInvoice(o.orderNumber)}
                              className="admin-btn admin-btn-accent admin-btn-sm"
                              title="Send invoice to customer">
                        <MailOpen className="w-3.5 h-3.5" /> Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={10} className="text-center py-8 text-[color:#6B5A46]">No pending orders 🎉</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
