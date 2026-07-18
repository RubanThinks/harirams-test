import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAccount } from "@/context/AccountContext";
import { TESTIDS } from "@/constants/testIds";

export default function AccountLoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const { login } = useAccount();
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setBusy(true);
    try {
      const r = await apiClient.post("/auth/send-otp", { phone });
      setOtpSent(true);
      setHint(r.data.hint || "");
      toast.success(r.data.message);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await apiClient.post("/auth/verify-otp", { phone, otp });
      login(phone);
      toast.success("Signed in!");
      navigate("/account");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid={TESTIDS.accountLoginPage} style={{ background: "var(--brand-cream)", minHeight: "100vh" }}>
      <div className="container-brand py-10 lg:py-14 max-w-md mx-auto">
        <button onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:underline"
                style={{ color: "var(--brand-primary)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
               style={{ background: "var(--brand-primary)" }}>
            <Phone className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl mb-2" style={{ color: "var(--brand-primary)" }}>
            My Account
          </h1>
          <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
            Sign in with your mobile number to see your orders.
          </p>
        </div>

        <div className="rounded-2xl border p-6 lg:p-8 space-y-5"
             style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                  style={{ color: "var(--brand-muted)" }}>Mobile Number *</span>
            <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "var(--brand-border)" }}>
              <span className="px-3 py-3 text-sm font-semibold"
                    style={{ background: "var(--brand-cream)", color: "var(--brand-primary)" }}>+91</span>
              <input
                data-testid={TESTIDS.accountLoginPhone}
                inputMode="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                disabled={otpSent}
                className="flex-1 bg-white px-3 py-3 outline-none no-spin"
                autoFocus
              />
            </div>
          </label>

          {!otpSent ? (
            <button
              data-testid={TESTIDS.accountLoginSendOtp}
              onClick={sendOtp}
              disabled={busy || phone.length !== 10}
              className="btn-primary w-full"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
            </button>
          ) : (
            <>
              {hint && (
                <div className="text-xs rounded-lg border p-3"
                     style={{ background: "#FFF3E0", borderColor: "var(--brand-secondary)", color: "var(--brand-text)" }}>
                  <ShieldCheck className="w-4 h-4 inline mr-1" style={{ color: "var(--brand-primary)" }} />
                  {hint}
                </div>
              )}
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                      style={{ color: "var(--brand-muted)" }}>Enter OTP</span>
                <input
                  data-testid={TESTIDS.accountLoginOtp}
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-xl border px-4 py-3 bg-white outline-none tracking-[0.5em] text-center font-bold text-lg"
                  placeholder="••••••"
                  autoFocus
                />
              </label>
              <button
                data-testid={TESTIDS.accountLoginVerify}
                onClick={verify}
                disabled={busy || otp.length !== 6}
                className="btn-primary w-full"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><CheckCircle2 className="w-4 h-4" /> Verify & Sign In</>)}
              </button>
              <button
                onClick={sendOtp}
                disabled={busy}
                className="btn-ghost w-full !py-2 text-sm"
              >
                Resend OTP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
