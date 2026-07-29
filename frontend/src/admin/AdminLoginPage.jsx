import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";
import "@/admin/admin.css";

export default function AdminLoginPage() {
  const { isAuthed, login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  if (isAuthed) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(username, password);
      toast.success("Welcome back, admin");
      navigate("/admin", { replace: true });
    } catch (e2) {
      const d = e2.response?.data?.detail || "Sign-in failed";
      setErr(typeof d === "string" ? d : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid={ADMIN_TID.loginPage} className="admin-shell min-h-screen flex items-center justify-center py-10">
      <form onSubmit={submit} className="admin-card w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/assets/logo/logo.webp" alt="Hariram's" className="h-14 w-20 object-contain mx-auto mb-3 rounded" />
          <h1 className="text-2xl mb-1">Admin Sign In</h1>
          <p className="text-sm text-[color:#6B5A46]">Hariram&apos;s Pure Cow Ghee — Console</p>
        </div>

        <label className="block mb-4">
          <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[color:#6B5A46]">
            Username
          </span>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:#6B5A46]" />
            <input
              data-testid={ADMIN_TID.loginUsername}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="admin-input pl-9"
              placeholder="admin"
              required
            />
          </div>
        </label>

        <label className="block mb-6">
          <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[color:#6B5A46]">
            Password
          </span>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:#6B5A46]" />
            <input
              data-testid={ADMIN_TID.loginPassword}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="admin-input pl-9"
              required
            />
          </div>
        </label>

        {err && (
          <div data-testid={ADMIN_TID.loginError}
               className="mb-4 text-sm rounded-lg px-3 py-2"
               style={{ background: "rgba(178,34,34,0.10)", color: "#B22222" }}>
            {err}
          </div>
        )}

        <button
          data-testid={ADMIN_TID.loginSubmit}
          type="submit"
          disabled={busy || !username || !password}
          className="admin-btn admin-btn-primary w-full justify-center"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Sign In</>}
        </button>
      </form>
    </div>
  );
}
