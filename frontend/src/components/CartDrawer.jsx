import React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";

export default function CartDrawer() {
  const { items, setQty, remove, subtotal, open, setOpen } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        data-testid={TESTIDS.cartDrawer}
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
        style={{ background: "var(--brand-cream)" }}
      >
        <SheetHeader className="px-6 py-5 border-b" style={{ borderColor: "var(--brand-border)" }}>
          <SheetTitle
            className="text-2xl"
            style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}
          >
            Your Cart
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review the items in your cart and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div
              data-testid={TESTIDS.cartEmpty}
              className="h-full flex flex-col items-center justify-center text-center gap-3 py-16"
            >
              <ShoppingBag className="w-14 h-14" style={{ color: "var(--brand-secondary)" }} />
              <h3 className="text-xl" style={{ color: "var(--brand-primary)" }}>Your cart is empty</h3>
              <p style={{ color: "var(--brand-muted)" }}>
                Add a pack of pure ghee to get started.
              </p>
              <button
                data-testid="cart-continue-shopping"
                className="btn-ghost mt-2"
                onClick={() => {
                  setOpen(false);
                  if (window.location.pathname === "/") {
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else {
                    navigate("/#products");
                  }
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => (
                <li
                  key={it.sku}
                  data-testid={TESTIDS.cartItem(it.sku)}
                  className="flex gap-3 p-3 rounded-2xl border"
                  style={{
                    background: "var(--brand-surface)",
                    borderColor: "var(--brand-border)",
                  }}
                >
                  <img
                    src={it.image}
                    alt={`${it.name} ${it.variant}`}
                    className="bottle-img w-20 h-24 object-contain rounded-xl bg-[color:var(--brand-cream)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-wider" style={{ color: "var(--brand-muted)" }}>
                          {it.variant}
                        </div>
                        <div className="font-semibold" style={{ color: "var(--brand-primary)" }}>
                          {it.name}
                        </div>
                      </div>
                      <button
                        data-testid={TESTIDS.cartRemove(it.sku)}
                        onClick={() => remove(it.sku)}
                        aria-label={`Remove ${it.variant} from cart`}
                        className="p-1 rounded-full hover:bg-[color:var(--brand-border)]/50"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "var(--brand-accent)" }} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border" style={{ borderColor: "var(--brand-border)" }}>
                        <button
                          data-testid={TESTIDS.cartQtyMinus(it.sku)}
                          onClick={() => setQty(it.sku, it.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center"
                          disabled={it.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{it.quantity}</span>
                        <button
                          data-testid={TESTIDS.cartQtyPlus(it.sku)}
                          onClick={() => setQty(it.sku, it.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-bold" style={{ color: "var(--brand-primary)" }}>
                        {formatINR(it.price * it.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-6 py-5 space-y-4" style={{ borderColor: "var(--brand-border)" }}>
            <div className="flex justify-between text-sm" style={{ color: "var(--brand-muted)" }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>Subtotal</span>
              <span
                data-testid={TESTIDS.cartSubtotal}
                className="text-2xl font-extrabold"
                style={{ color: "var(--brand-primary)", fontFamily: "'Playfair Display', serif" }}
              >
                {formatINR(subtotal)}
              </span>
            </div>
            <button
              data-testid={TESTIDS.cartCheckoutBtn}
              onClick={goCheckout}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
