import React, { useEffect } from "react";
import { ShoppingBag, ArrowRight, X, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

/**
 * CartBubbleNotification
 * A non-disruptive, floating Apple-style liquid frosted bubble notification.
 * Appears when an item is added to cart without blocking the user from continuing to shop!
 */
export default function CartBubbleNotification() {
  const { recentNotification, clearNotification, setOpen, count, subtotal } = useCart();

  useEffect(() => {
    if (!recentNotification) return;
    const timer = setTimeout(() => {
      clearNotification();
    }, 4500);
    return () => clearTimeout(timer);
  }, [recentNotification, clearNotification]);

  if (!recentNotification) return null;

  const { product, qty } = recentNotification;

  return (
    <div
      data-testid="cart-bubble-notification"
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-3rem)] animate-scale-up"
    >
      <div className="relative rounded-2xl bg-white border border-stone-200 p-3.5 sm:p-4 shadow-xl text-stone-900">
        <div className="flex items-center gap-3">
          {/* Product Thumbnail */}
          <div className="relative shrink-0 w-12 h-14 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-center p-1 overflow-hidden shadow-xs">
            <img
              src={
                product?.sku === "HG200" || product?.variant?.includes("200") ? "/assets/products/HG200_front.png" :
                product?.sku === "HG500" || product?.variant?.includes("500") ? "/assets/products/HG500_front.png" :
                product?.sku === "HG5000" || product?.variant?.includes("5000") || product?.variant?.toLowerCase().includes("5l") ? "/assets/products/HG5000_front.png" :
                "/assets/products/HG1000_front.png"
              }
              alt={product.name}
              className="w-full h-full object-contain"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              +{qty}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
              <span>Added to Cart</span>
            </div>
            <div className="text-sm font-semibold truncate text-stone-900 font-sf">
              {product.name} <span className="text-amber-800 font-normal">({product.variant})</span>
            </div>
            <div className="text-xs font-price text-stone-700 mt-0.5">
              {formatINR(product.price * qty)}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              clearNotification();
              setOpen(true);
            }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#D93F3F] hover:bg-[#C23030] transition-colors shadow-xs active:scale-95 cursor-pointer font-sf"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart ({count})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss button */}
          <button
            onClick={clearNotification}
            aria-label="Dismiss notification"
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient progress line that smoothly fades */}
        <div className="mt-2.5 h-1 w-full bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#15803D] rounded-full animate-[progress_4.5s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}
