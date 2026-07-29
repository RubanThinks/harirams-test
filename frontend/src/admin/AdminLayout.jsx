import React from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";
import { LogOut, Package, Truck, ClipboardList, CheckCircle2, LayoutDashboard, FileCog } from "lucide-react";
import "@/admin/admin.css";

const NAV = [
  { key: "dashboard", label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { key: "products", label: "Products", to: "/admin/products", icon: Package },
  { key: "shipping", label: "Shipping Rates", to: "/admin/shipping", icon: Truck },
  { key: "config", label: "Config Files", to: "/admin/config", icon: FileCog },
  { key: "pending", label: "Pending Orders", to: "/admin/orders/pending", icon: ClipboardList },
  { key: "completed", label: "Completed Orders", to: "/admin/orders/completed", icon: CheckCircle2 },
];

export default function AdminLayout({ children }) {
  const { isAuthed, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAuthed) return <Navigate to="/admin/login" replace />;

  const doLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell" data-testid={ADMIN_TID.layout}>
      <header className="admin-navbar">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center gap-3 lg:gap-6 h-16">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/assets/logo/logo.webp" alt="Hariram's" className="h-10 w-14 object-contain rounded" />
            <div className="leading-tight">
              <div className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                HARIRAM&apos;S
              </div>
              <div className="text-[11px] opacity-80 uppercase tracking-wider">Admin Console</div>
            </div>
          </Link>
          <nav data-testid={ADMIN_TID.navMenu} className="flex items-center gap-1 flex-wrap ml-auto">
            {NAV.map((n) => (
              <NavLink
                key={n.key}
                to={n.to}
                end={n.end}
                data-testid={ADMIN_TID.navItem(n.key)}
                className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              >
                <n.icon className="w-4 h-4" />
                <span className="hidden md:inline">{n.label}</span>
              </NavLink>
            ))}
            <button
              data-testid={ADMIN_TID.logout}
              onClick={doLogout}
              className="admin-nav-link"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
