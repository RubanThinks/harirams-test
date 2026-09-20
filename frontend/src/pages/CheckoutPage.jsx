import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, CheckCircle2, Lock, ShieldCheck, Loader2, Phone } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useConfig } from "@/hooks/useConfig";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const STEPS = ["ADDRESS", "OTP", "PAYMENT"];

export default function CheckoutPage() {
  const { items, subtotal, clear, count } = useCart();
  const { data: company } = useConfig("company");
  const navigate = useNavigate();

  const [step, setStep] = useState("ADDRESS");
  const [address, setAddress] = useState({
    name: "", phone: "", line1: "", line2: "", landmark: "",
    city: "", state: "Tamil Nadu", pincode: "",
  });
  const [shipping, setShipping] = useState({ charge: null, rule: null });
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeBusy, setPincodeBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [mockHint, setMockHint] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [placing, setPlacing] = useState(false);
  const [prefilledFromLast, setPrefilledFromLast] = useState(false);
  const nameInputRef = useRef(null);
  const otpInputRef = useRef(null);

  // FIX #1: Auto-focus first field (Full Name) when checkout mounts
  useEffect(() => {
    if (nameInputRef.current) nameInputRef.current.focus();
  }, []);

  useEffect(() => {
    if (count === 0) {
      toast.info("Your cart is empty");
      navigate("/");
    }
  }, [count, navigate]);

  // Shared shipping-calculator that accepts explicit args (used after prefill + on pincode blur)
  const calculateShipping = async (pin, city, state) => {
    if (!/^\d{6}$/.test(pin)) {
      setPincodeError(pin?.length ? "Enter a valid 6-digit PIN code" : "");
      setShipping({ charge: null, rule: null });
      return;
    }
    setPincodeError("");
    setPincodeBusy(true);
    try {
      const r = await apiClient.post("/shipping/calculate", {
        pincode: pin, city, state, subtotal,
        items: items.map((i) => ({ variant: i.variant, quantity: i.quantity })),
      });
      setShipping({ charge: r.data.charge, rule: r.data.rule });
    } catch (err) {
      setPincodeError(err.response?.data?.detail || "Could not calculate shipping");
      setShipping({ charge: null, rule: null });
    } finally {
      setPincodeBusy(false);
    }
  };

  // Look up last-address on phone blur
  const handlePhoneBlur = async () => {
    const phone = address.phone.replace(/\D/g, "");
    if (phone.length !== 10) return;
    try {
      const r = await apiClient.get("/customers/last-address", { params: { phone } });
      if (r.data.found) {
        const a = r.data.address;
        const merged = {
          ...address,
          phone,
          name: a.name || address.name,
          line1: a.line1 || address.line1,
          line2: a.line2 || address.line2,
          landmark: a.landmark || address.landmark,
          city: a.city || address.city,
          state: a.state || address.state,
          pincode: a.pincode || address.pincode,
        };
        setAddress(merged);
        setPrefilledFromLast(true);
        toast.success("Welcome back! We've pre-filled your last address — please verify.");
        // FIX #2: Auto-calculate shipping so "Continue" activates immediately
        if (/^\d{6}$/.test(merged.pincode)) {
          calculateShipping(merged.pincode, merged.city, merged.state);
        }
      }
    } catch (_) { /* ignore */ }
  };

  // Auto-calculate shipping when a valid pincode is entered
  const handlePincodeBlur = async () => {
    await calculateShipping(address.pincode.trim(), address.city, address.state);
  };

  const canContinueAddress =
    address.name.trim() &&
    /^\d{10}$/.test(address.phone.replace(/\D/g, "")) &&
    address.line1.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    /^\d{6}$/.test(address.pincode) &&
    shipping.charge !== null;

  const sendOtp = async () => {
    setOtpBusy(true);
    try {
      const r = await apiClient.post("/auth/send-otp", { phone: address.phone });
      setOtpSent(true);
      setMockHint(r.data.hint || "");
      toast.success(r.data.message);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not send OTP");
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    setOtpBusy(true);
    try {
      await apiClient.post("/auth/verify-otp", { phone: address.phone, otp });
      setOtpVerified(true);
      setStep("PAYMENT");
      toast.success("Phone verified!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setOtpBusy(false);
    }
  };

  const gstPct = Number(company?.gstPercent ?? 5);
  const gst = Math.round(subtotal * gstPct) / 100;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const total = subtotal + gst + (shipping.charge || 0);

      // COD skips the payment gateway entirely.
      if (paymentMethod === "COD") {
        await finalizeOrder(total, { paymentMethod: "COD", paymentReference: null });
        return;
      }

      // 1. Create a Razorpay order server-side.
      const orderRes = await apiClient.post("/payments/razorpay/create-order", {
        amount: total,
        receipt: `HR-${Date.now().toString().slice(-10)}`,
        notes: { phone: address.phone, name: address.name },
      });
      const { orderId, amount, currency, keyId } = orderRes.data;

      if (typeof window.Razorpay !== "function") {
        toast.error("Payment gateway failed to load. Please refresh and try again.");
        setPlacing(false);
        return;
      }

      // 2. Open Razorpay checkout modal.
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: company?.brandName || "Hariram's",
        description: `Pure Cow Ghee — ${items.reduce((n, i) => n + i.quantity, 0)} item(s)`,
        image: "/assets/logo/logo.webp",
        theme: { color: "#174C2B" },
        prefill: {
          name: address.name,
          contact: `+91${address.phone}`,
        },
        method: {
          upi: paymentMethod === "UPI",
          card: paymentMethod === "CARD",
          netbanking: paymentMethod === "NETBANKING",
          wallet: true,
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.info("Payment cancelled. Your cart is still saved.");
          },
        },
        handler: async (rzpRes) => {
          try {
            // 3. Verify signature on our backend.
            await apiClient.post("/payments/razorpay/verify", {
              razorpay_order_id: rzpRes.razorpay_order_id,
              razorpay_payment_id: rzpRes.razorpay_payment_id,
              razorpay_signature: rzpRes.razorpay_signature,
            });
            // 4. Finalize the order in our system.
            await finalizeOrder(total, {
              paymentMethod,
              paymentReference: rzpRes.razorpay_payment_id,
            });
          } catch (err) {
            toast.error(err.response?.data?.detail || "Payment verification failed");
            setPlacing(false);
          }
        },
      });
      rzp.on("payment.failed", (resp) => {
        toast.error(resp.error?.description || "Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Order could not be placed");
      setPlacing(false);
    }
  };

  const finalizeOrder = async (total, { paymentMethod: pm, paymentReference }) => {
    const r = await apiClient.post("/orders", {
      phone: address.phone,
      address: {
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      items: items.map((i) => ({
        sku: i.sku,
        name: i.name,
        variant: i.variant,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      subtotal,
      gst,
      shipping: shipping.charge || 0,
      total,
      paymentMethod: pm,
      paymentReference,
    });
    const orderNo = r.data.order.orderNumber;
    const itemsLine = items
      .map((i) => `${i.name} ${i.variant} × ${i.quantity}`)
      .join(", ");
    toast.success(
      `Order ${orderNo} placed successfully!`,
      { description: itemsLine, duration: 6000 }
    );
    clear();
    navigate(`/order/${orderNo}`, { state: { order: r.data.order } });
    setPlacing(false);
  };

  const total = subtotal + gst + (shipping.charge ?? 0);

  return (
    <div style={{ background: "var(--brand-cream)", minHeight: "100vh" }}>
      <div className="container-brand py-10 lg:py-14">
        <div className="mb-8">
          <button onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  style={{ color: "var(--brand-primary)" }}>
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left — Steps */}
          <div className="lg:col-span-2 space-y-6">
            <StepHeader step={step} />

            {/* ADDRESS */}
            <section
              data-testid={TESTIDS.checkoutStepAddress}
              className={`rounded-2xl border p-6 lg:p-8 ${step === "ADDRESS" ? "" : "opacity-70"}`}
              style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
            >
              <h3 className="text-2xl mb-1" style={{ color: "var(--brand-primary)" }}>1. Delivery Address</h3>
              <p className="text-sm mb-6" style={{ color: "var(--brand-muted)" }}>
                We deliver across India. All fields marked * are required.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *" required>
                  <input data-testid={TESTIDS.addrName} className={inputCls}
                         ref={nameInputRef}
                         value={address.name}
                         onChange={(e) => setAddress({ ...address, name: e.target.value })}
                         disabled={step !== "ADDRESS"} />
                </Field>
                <Field label="Mobile Number * (India only)">
                  <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "var(--brand-border)" }}>
                    <span className="px-3 py-3 text-sm font-semibold" style={{ background: "var(--brand-cream)", color: "var(--brand-primary)" }}>+91</span>
                    <input data-testid={TESTIDS.addrPhone}
                           className="flex-1 bg-white px-3 py-3 outline-none no-spin"
                           inputMode="tel" maxLength={10}
                           value={address.phone}
                           onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                           onBlur={handlePhoneBlur}
                           disabled={step !== "ADDRESS"} />
                  </div>
                  {prefilledFromLast && (
                    <p className="mt-1 text-xs" style={{ color: "var(--brand-primary)" }}>
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      Welcome back — please verify your saved address below.
                    </p>
                  )}
                </Field>
                <Field label="Address Line 1 *" className="sm:col-span-2">
                  <input data-testid={TESTIDS.addrLine1} className={inputCls}
                         value={address.line1}
                         onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                         disabled={step !== "ADDRESS"} />
                </Field>
                <Field label="Address Line 2">
                  <input data-testid={TESTIDS.addrLine2} className={inputCls}
                         value={address.line2}
                         onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                         disabled={step !== "ADDRESS"} />
                </Field>
                <Field label="Landmark">
                  <input data-testid={TESTIDS.addrLandmark} className={inputCls}
                         value={address.landmark}
                         onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                         disabled={step !== "ADDRESS"} />
                </Field>
                <Field label="City *">
                  <input data-testid={TESTIDS.addrCity} className={inputCls}
                         value={address.city}
                         onChange={(e) => setAddress({ ...address, city: e.target.value })}
                         disabled={step !== "ADDRESS"} />
                </Field>
                <Field label="State *">
                  <select data-testid={TESTIDS.addrState} className={inputCls}
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          disabled={step !== "ADDRESS"}>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="PIN Code *" className="sm:col-span-2">
                  <div className="relative">
                    <input data-testid={TESTIDS.addrPincode} className={inputCls}
                           inputMode="numeric" maxLength={6}
                           value={address.pincode}
                           onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                           onBlur={handlePincodeBlur}
                           disabled={step !== "ADDRESS"} />
                    {pincodeBusy && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--brand-primary)" }} />
                    )}
                    {shipping.charge !== null && !pincodeBusy && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>
                        <CheckCircle2 className="w-4 h-4 inline mr-1" />
                        Shipping {shipping.charge === 0 ? "FREE" : formatINR(shipping.charge)}
                      </span>
                    )}
                  </div>
                  {pincodeError && <p className="mt-1 text-sm" style={{ color: "var(--brand-accent)" }}>{pincodeError}</p>}
                </Field>
              </div>

              {step === "ADDRESS" && (
                <div className="mt-6 flex justify-end">
                  <button
                    data-testid={TESTIDS.addrContinue}
                    disabled={!canContinueAddress}
                    onClick={() => { setStep("OTP"); sendOtp(); }}
                    className="btn-primary"
                  >
                    Continue to Verification <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>

            {/* OTP */}
            {step !== "ADDRESS" && (
              <section
                data-testid={TESTIDS.checkoutStepOtp}
                className={`rounded-2xl border p-6 lg:p-8 ${step === "OTP" ? "" : "opacity-70"}`}
                style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
              >
                <h3 className="text-2xl mb-1" style={{ color: "var(--brand-primary)" }}>2. Verify Mobile</h3>
                <p className="text-sm mb-6" style={{ color: "var(--brand-muted)" }}>
                  We sent a 6-digit code to <strong>+91-{address.phone}</strong>.
                </p>

                {mockHint && (
                  <div className="mb-4 text-xs rounded-lg border p-3"
                       style={{ background: "#FFF3E0", borderColor: "var(--brand-secondary)", color: "var(--brand-text)" }}>
                    <ShieldCheck className="w-4 h-4 inline mr-1" style={{ color: "var(--brand-primary)" }} />
                    {mockHint}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                  <Field label="Enter OTP *" className="flex-1 w-full">
                    <input
                      data-testid={TESTIDS.otpInput}
                      className={`${inputCls} tracking-[0.5em] text-center font-bold text-lg`}
                      inputMode="numeric" maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={otpVerified}
                      placeholder="••••••"
                    />
                  </Field>
                  <button
                    data-testid={TESTIDS.otpResend}
                    onClick={sendOtp}
                    disabled={otpBusy || otpVerified}
                    className="btn-ghost !py-3"
                  >
                    <Phone className="w-4 h-4 inline mr-1" /> Resend
                  </button>
                  <button
                    data-testid={TESTIDS.otpVerify}
                    onClick={verifyOtp}
                    disabled={otp.length !== 6 || otpBusy || otpVerified}
                    className="btn-primary !py-3"
                  >
                    {otpBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                  </button>
                </div>
                {otpVerified && (
                  <p className="mt-3 text-sm inline-flex items-center gap-1" style={{ color: "var(--brand-primary)" }}>
                    <CheckCircle2 className="w-4 h-4" /> Mobile verified
                  </p>
                )}
              </section>
            )}

            {/* PAYMENT */}
            {step === "PAYMENT" && (
              <section
                data-testid={TESTIDS.checkoutStepPayment}
                className="rounded-2xl border p-6 lg:p-8"
                style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
              >
                <h3 className="text-2xl mb-1" style={{ color: "var(--brand-primary)" }}>3. Payment</h3>
                <p className="text-sm mb-4" style={{ color: "var(--brand-muted)" }}>
                  Select payment method. You will be redirected to Razorpay's secure checkout.
                </p>
                <div className="text-xs mb-4 rounded-lg border p-3 inline-flex items-center gap-2"
                     style={{ background: "#FFF3E0", borderColor: "var(--brand-secondary)", color: "var(--brand-text)" }}>
                  <Lock className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
                  Razorpay test mode — use any UPI ID like <span className="font-mono ml-1">success@razorpay</span> to complete a demo payment.
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["UPI", "CARD", "NETBANKING", "COD"].map((m) => (
                    <button
                      key={m}
                      data-testid={TESTIDS.payMethod(m)}
                      onClick={() => setPaymentMethod(m)}
                      className={`py-3 px-2 rounded-xl border font-semibold text-sm transition ${
                        paymentMethod === m ? "" : "opacity-70 hover:opacity-100"
                      }`}
                      style={{
                        borderColor: paymentMethod === m ? "var(--brand-primary)" : "var(--brand-border)",
                        background: paymentMethod === m ? "var(--brand-primary)" : "white",
                        color: paymentMethod === m ? "white" : "var(--brand-text)",
                      }}
                    >
                      {m === "COD" ? "Cash on Delivery" : m}
                    </button>
                  ))}
                </div>

                <button
                  data-testid={TESTIDS.payNow}
                  onClick={placeOrder}
                  disabled={placing}
                  className="btn-primary w-full mt-6"
                >
                  {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-4 h-4" /> Pay {formatINR(total)}</>}
                </button>
              </section>
            )}
          </div>

          {/* Right — Order Summary */}
          <aside
            data-testid={TESTIDS.orderSummary}
            className="lg:sticky lg:top-28 h-fit rounded-2xl border p-6 lg:p-7"
            style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
          >
            <h3 className="text-xl mb-4" style={{ color: "var(--brand-primary)" }}>Order Summary</h3>
            <ul className="space-y-3 mb-5">
              {items.map((it) => (
                <li key={it.sku} className="flex items-center gap-3">
                  <img src={it.image} alt="" className="bottle-img w-14 h-16 object-contain rounded-lg bg-[color:var(--brand-cream)]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: "var(--brand-primary)" }}>{it.name}</div>
                    <div className="text-xs" style={{ color: "var(--brand-muted)" }}>{it.variant} × {it.quantity}</div>
                  </div>
                  <div className="font-semibold text-sm" style={{ color: "var(--brand-text)" }}>
                    {formatINR(it.price * it.quantity)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2 pt-4 border-t" style={{ borderColor: "var(--brand-border)" }}>
              <Row label="Subtotal" value={formatINR(subtotal)} />
              <div data-testid={TESTIDS.orderGst} className="flex justify-between text-sm">
                <span style={{ color: "var(--brand-text)" }}>GST ({gstPct}%)</span>
                <span className="font-semibold" style={{ color: "var(--brand-text)" }}>{formatINR(gst)}</span>
              </div>
              <Row
                label="Shipping"
                value={
                  shipping.charge == null
                    ? <span data-testid={TESTIDS.orderShipping} style={{ color: "var(--brand-muted)" }}>Enter PIN code</span>
                    : shipping.charge === 0
                      ? <span data-testid={TESTIDS.orderShipping} style={{ color: "var(--brand-primary)" }}>FREE</span>
                      : <span data-testid={TESTIDS.orderShipping}>{formatINR(shipping.charge)}</span>
                }
              />
              <div className="flex justify-between items-baseline pt-3 mt-1 border-t" style={{ borderColor: "var(--brand-border)" }}>
                <span className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>Total</span>
                <span data-testid={TESTIDS.orderTotal} className="text-2xl font-extrabold"
                      style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}>
                  {formatINR(total)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border px-4 py-3 bg-white outline-none focus:border-[color:var(--brand-primary)]";

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--brand-muted)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--brand-text)" }}>{label}</span>
      <span className="font-semibold" style={{ color: "var(--brand-text)" }}>{value}</span>
    </div>
  );
}

function StepHeader({ step }) {
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center justify-between px-2 mb-3">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                background: i <= idx ? "var(--brand-primary)" : "var(--brand-border)",
                color: i <= idx ? "white" : "var(--brand-text)",
              }}
            >
              {i + 1}
            </span>
            <span className="hidden sm:inline text-sm font-semibold uppercase tracking-wide"
                  style={{ color: i <= idx ? "var(--brand-primary)" : "var(--brand-muted)" }}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className="flex-1 mx-2 h-px"
                  style={{ background: i < idx ? "var(--brand-primary)" : "var(--brand-border)" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
