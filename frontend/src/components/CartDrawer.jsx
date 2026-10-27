import React from "react";
import { Plus, Minus, Trash2, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { TESTIDS } from "@/constants/testIds";

export default function CartDrawer() {
  const { items, setQty, remove, subtotal, open, setOpen } = useCart();
  const navigate = useNavigate();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const goCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        data-testid={TESTIDS.cartDrawer}
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-[#FFFDF7] border-l border-amber-900/15 shadow-2xl text-stone-900"
      >
        {/* Solid Professional Header */}
        <SheetHeader className="px-6 py-4.5 bg-white border-b border-stone-200/90 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-900 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <SheetTitle
                className="text-xl font-serif font-bold text-stone-900 tracking-tight"
              >
                Your Cart
              </SheetTitle>
              <div className="text-xs text-stone-500 font-medium mt-0.5">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"} selected
              </div>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Review the items in your cart and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {/* Free Delivery / Freshness Reassurance Strip */}
        <div className="bg-emerald-50/90 px-6 py-2.5 border-b border-emerald-100/90 flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>100% Pure Cow Ghee • Direct from Dairy</span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#FAF7F0]/60">
          {items.length === 0 ? (
            <div
              data-testid={TESTIDS.cartEmpty}
              className="h-full flex flex-col items-center justify-center text-center gap-3 py-16"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-1">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">Your cart is empty</h3>
              <p className="text-sm text-stone-500 max-w-xs">
                Add our traditional Pure Cow Ghee packs to experience Vedic goodness.
              </p>
              <button
                data-testid="cart-continue-shopping"
                className="btn-primary mt-3 text-xs"
                onClick={() => {
                  setOpen(false);
                  if (window.location.pathname === "/") {
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else {
                    navigate("/#products");
                  }
                }}
              >
                Browse Ghee Packs
              </button>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {items.map((it) => (
                <li
                  key={it.sku}
                  data-testid={TESTIDS.cartItem(it.sku)}
                  className="flex gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:border-amber-700/30 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative shrink-0 w-20 h-24 rounded-xl bg-amber-50/70 border border-amber-200/50 flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={
                        it.sku === "HG200" || it.variant?.includes("200") ? "/assets/products/HG200_front.png" :
                        it.sku === "HG500" || it.variant?.includes("500") ? "/assets/products/HG500_front.png" :
                        it.sku === "HG5000" || it.variant?.includes("5000") || it.variant?.toLowerCase().includes("5l") ? "/assets/products/HG5000_front.png" :
                        "/assets/products/HG1000_front.png"
                      }
                      alt={`${it.name} ${it.variant}`}
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                          {it.variant} Pack
                        </span>
                        <div className="font-serif font-bold text-stone-900 text-sm truncate">
                          {it.name}
                        </div>
                        <div className="text-xs text-stone-500 font-price">
                          {formatINR(it.price)} each
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        data-testid={TESTIDS.cartRemove(it.sku)}
                        onClick={() => remove(it.sku)}
                        aria-label={`Remove ${it.variant} from cart`}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-100">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center rounded-lg border border-stone-300 bg-stone-50 shadow-xs overflow-hidden">
                        <button
                          data-testid={TESTIDS.cartQtyMinus(it.sku)}
                          onClick={() => setQty(it.sku, it.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 transition-colors cursor-pointer disabled:opacity-40"
                          disabled={it.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="w-8 text-center font-price font-bold text-sm text-stone-900">
                          {it.quantity}
                        </span>
                        <button
                          data-testid={TESTIDS.cartQtyPlus(it.sku)}
                          onClick={() => setQty(it.sku, it.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <div className="font-price font-bold text-base text-stone-900">
                        {formatINR(it.price * it.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Amazon/Flipkart Style Sticky Bottom Checkout Container */}
        {items.length > 0 && (
          <div className="bg-white border-t border-stone-200 px-6 py-4.5 space-y-3.5 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-price font-medium text-stone-800">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  FREE
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-stone-200/80">
              <div>
                <span className="text-base font-bold text-stone-900">Order Total</span>
                <div className="text-[11px] text-stone-500">Inclusive of all taxes</div>
              </div>
              <span
                data-testid={TESTIDS.cartSubtotal}
                className="font-price text-2xl font-bold tracking-tight text-emerald-950"
              >
                {formatINR(subtotal)}
              </span>
            </div>

            <button
              data-testid={TESTIDS.cartCheckoutBtn}
              onClick={goCheckout}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer font-sf uppercase"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="text-center text-[11px] text-stone-500 font-medium">
              🔒 Safe & Secure Checkout via Razorpay / UPI / Cards
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
