import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ClipboardList, CheckCircle2, TrendingUp } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";

export default function AdminDashboardPage() {
  const { client } = useAdminAuth();
  const [stats, setStats] = useState({ pending: 0, completed: 0, products: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [pend, comp, prods] = await Promise.all([
          client.get("/admin/orders/pending"),
          client.get("/admin/orders/completed"),
          client.get("/admin/products"),
        ]);
        const revenue = (comp.data.orders || []).reduce((s, o) => s + Number(o.total || 0), 0);
        setStats({
          pending: pend.data.count || 0,
          completed: comp.data.count || 0,
          products: (prods.data.products || []).length,
          revenue,
        });
      } catch (_) { /* handled by axios */ }
    })();
  }, [client]);

  const Card = ({ testid, label, value, icon: Icon, to, accent }) => (
    <Link to={to} className="admin-card block hover:shadow-md transition"
          data-testid={testid} style={{ borderLeft: `4px solid ${accent}` }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `${accent}22`, color: accent }}>
          <Icon className="w-5 h-5" />
        </span>
        <span className="text-xs uppercase tracking-wider text-[color:#6B5A46]">{label}</span>
      </div>
      <div className="text-3xl font-extrabold" style={{ color: "#174C2B", fontFamily: "'Playfair Display', serif" }}>
        {value}
      </div>
    </Link>
  );

  return (
    <div data-testid={ADMIN_TID.dashboardPage}>
      <h1 className="text-3xl mb-2">Dashboard</h1>
      <p className="text-sm text-[color:#6B5A46] mb-6">Snapshot of your store today.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card testid={ADMIN_TID.statPending} label="Pending Orders" value={stats.pending}
              icon={ClipboardList} to="/admin/orders/pending" accent="#B22222" />
        <Card testid={ADMIN_TID.statCompleted} label="Completed (30d)" value={stats.completed}
              icon={CheckCircle2} to="/admin/orders/completed" accent="#174C2B" />
        <Card testid={ADMIN_TID.statProducts} label="Products" value={stats.products}
              icon={Package} to="/admin/products" accent="#D89B22" />
        <Card testid="admin-stat-revenue" label="Revenue (30d)" value={`₹${Math.round(stats.revenue).toLocaleString("en-IN")}`}
              icon={TrendingUp} to="/admin/orders/completed" accent="#8A620F" />
      </div>

      <div className="admin-card mt-6">
        <h2 className="text-lg mb-2">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/orders/pending" className="admin-btn admin-btn-primary">Manage Pending Orders</Link>
          <Link to="/admin/products" className="admin-btn admin-btn-ghost">Edit Catalog</Link>
          <Link to="/admin/shipping" className="admin-btn admin-btn-ghost">Update Shipping Rates</Link>
        </div>
      </div>
    </div>
  );
}
