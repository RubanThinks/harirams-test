import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, Loader2, User, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";
import "@/admin/admin.css";

export default function AdminLoginPage() {
  const { isAuthed, requestOtp, verifyOtp } = useAdminAuth();
  const [stage, setStage] = useState("password"); // "password" | "otp"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challenge, setChallenge] = useState(null); // { sessionId, otpTarget, mockOtp, ttlMinutes }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  if (isAuthed) return <Navigate to="/admin" replace />;

  const submitPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const data = await requestOtp(username, password);
      setChallenge(data);
      setStage("otp");
      setOtp("");
      toast.success(`OTP sent to ${data.otpTarget}`);
    } catch (e2) {
      const d = e2.response?.data?.detail || "Sign-in failed";
      setErr(typeof d === "string" ? d : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await verifyOtp(challenge.sessionId, otp);
      toast.success("Welcome back, admin");
      navigate("/admin", { replace: true });
    } catch (e2) {
      const d = e2.response?.data?.detail || "OTP verification failed";
      setErr(typeof d === "string" ? d : "OTP verification failed");
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    setStage("password");
    setChallenge(null);
    setOtp("");
    setErr("");
  };

  return (
    <div data-testid={ADMIN_TID.loginPage} className="admin-shell min-h-screen flex items-center justify-center py-10">
      <div className="admin-card w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/assets/logo/logo.webp" alt="Hariram's" className="h-14 w-20 object-contain mx-auto mb-3 rounded" />
          <h1 className="text-2xl mb-1">Admin Sign In</h1>
          <p className="text-sm text-[color:#6B5A46]">Hariram&apos;s Pure Cow Ghee — Console</p>
        </div>

        {stage === "password" && (
          <form onSubmit={submitPassword}>
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
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Continue</>}
            </button>
          </form>
        )}

        {stage === "otp" && challenge && (
          <form onSubmit={submitOtp} data-testid={ADMIN_TID.loginOtpStage}>
            <div className="mb-4 flex items-center gap-3 rounded-lg px-3 py-2"
                 style={{ background: "rgba(23,76,43,0.08)" }}>
              <ShieldCheck className="w-5 h-5 text-[color:#174C2B]" />
              <div className="text-sm">
                <div className="font-semibold text-[color:#174C2B]">Two-Factor Verification</div>
                <div className="text-[color:#6B5A46]">
                  We sent a 6-digit code via WhatsApp to
                  <span className="font-mono font-semibold text-[color:#3B2414] ml-1">
                    {challenge.otpTarget}
                  </span>
                  . Enter it below to finish signing in.
                </div>
              </div>
            </div>

            {challenge.mock && challenge.mockOtp && (
              <div data-testid={ADMIN_TID.loginOtpMockHint}
                   className="mb-4 text-xs rounded-lg px-3 py-2"
                   style={{ background: "rgba(216,155,34,0.15)", color: "#7A5B12" }}>
                <span className="font-semibold uppercase tracking-wider mr-1">Mock mode:</span>
                real MSG91 WhatsApp delivery is pending. Use OTP&nbsp;
                <span className="font-mono font-bold">{challenge.mockOtp}</span>.
              </div>
            )}

            <label className="block mb-6">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[color:#6B5A46]">
                One-Time Password
              </span>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:#6B5A46]" />
                <input
                  data-testid={ADMIN_TID.loginOtpInput}
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  className="admin-input pl-9 tracking-[0.4em] font-mono text-center text-lg"
                  placeholder="••••••"
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

            <div className="flex gap-2">
              <button
                type="button"
                data-testid={ADMIN_TID.loginOtpBack}
                onClick={back}
                disabled={busy}
                className="admin-btn admin-btn-ghost"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                data-testid={ADMIN_TID.loginOtpSubmit}
                disabled={busy || otp.length !== 6}
                className="admin-btn admin-btn-primary flex-1 justify-center"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Verify & Sign In</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
