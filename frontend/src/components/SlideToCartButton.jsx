import React, { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingCart, Check, ChevronRight } from "lucide-react";

/**
 * SlideToCartButton
 * A 100% solid-color, tactile Apple-style swipe button for "Add to Cart".
 * Features:
 * - 100% SOLID COLOURS (warm solid cream track, solid brand red reveal, solid green success)
 * - Zero glassmorphism, zero translucency, zero neon glow or shimmering gradient
 * - Apple SF Pro typography with high-contrast crisp text
 * - Tactile physical feel: smooth drag physics + single-click/tap instant auto-slide
 * - Pure tactile satisfaction in UI
 */
export default function SlideToCartButton({
  onAdd,
  disabled = false,
  testId,
  productName = "Product",
  variant = "",
  compact = false,
  className = "",
}) {
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const autoAnimateRef = useRef(null);

  const buttonHeight = compact ? 44 : 50;
  const thumbSize = compact ? 36 : 42;

  const maxTravel = useCallback(() => {
    if (!trackRef.current) return 180;
    return Math.max(10, trackRef.current.clientWidth - thumbSize - 8);
  }, [thumbSize]);

  const triggerAdd = useCallback(() => {
    setIsSuccess(true);
    setDragProgress(1);
    if (typeof onAdd === "function") {
      onAdd();
    }
    // Hold success state for 1.8s then spring back to ready
    setTimeout(() => {
      setIsSuccess(false);
      setDragProgress(0);
    }, 1800);
  }, [onAdd]);

  // Smooth auto-slide animation for single-click / tap
  const animateAutoSlide = useCallback(() => {
    if (isSuccess) return;
    let start = null;
    const duration = 220; // ms

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - t, 3);
      setDragProgress(ease);

      if (t < 1) {
        autoAnimateRef.current = requestAnimationFrame(step);
      } else {
        triggerAdd();
      }
    };
    autoAnimateRef.current = requestAnimationFrame(step);
  }, [isSuccess, triggerAdd]);

  // Global window pointer listeners for tactile responsive drag
  useEffect(() => {
    const onMove = (e) => {
      if (!isPointerDownRef.current || disabled || isSuccess) return;
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
      const deltaX = clientX - startXRef.current;
      const max = maxTravel();
      const clampedDelta = Math.max(0, Math.min(deltaX, max));
      const prog = max > 0 ? clampedDelta / max : 0;
      setDragProgress(prog);
      currentXRef.current = clientX;
    };

    const onUp = () => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      setIsDragging(false);

      const deltaX = currentXRef.current - startXRef.current;
      const max = maxTravel();

      // If barely moved (< 10px), treat as tap/click -> auto-slide to completion!
      if (Math.abs(deltaX) < 10) {
        animateAutoSlide();
        return;
      }

      // If dragged beyond 40%, complete the action!
      if (max > 0 && deltaX / max >= 0.4) {
        triggerAdd();
      } else {
        setDragProgress(0);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [disabled, isSuccess, maxTravel, animateAutoSlide, triggerAdd]);

  // Pointer Down on the thumb or button
  const handlePointerDown = (e) => {
    if (disabled || isSuccess) return;
    isPointerDownRef.current = true;
    startXRef.current = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    currentXRef.current = startXRef.current;
    setIsDragging(true);
  };

  useEffect(() => {
    return () => {
      if (autoAnimateRef.current) cancelAnimationFrame(autoAnimateRef.current);
    };
  }, []);

  const max = maxTravel();
  const currentTranslateX = dragProgress * max;

  if (disabled) {
    return (
      <div
        data-testid={testId}
        style={{ height: `${buttonHeight}px` }}
        className={`w-full rounded-full flex items-center justify-center font-sf font-bold text-xs uppercase tracking-wider text-stone-400 bg-stone-200 border border-stone-300 cursor-not-allowed select-none ${className}`}
        aria-disabled="true"
      >
        Sold Out
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      data-testid={testId}
      role="button"
      tabIndex={0}
      aria-label={`Slide to add ${variant} ${productName} to cart`}
      onClick={() => {
        if (!isDragging && !isSuccess) {
          animateAutoSlide();
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isSuccess) {
          e.preventDefault();
          animateAutoSlide();
        }
      }}
      style={{
        height: `${buttonHeight}px`,
        touchAction: "none",
      }}
      className={`relative w-full rounded-full overflow-hidden select-none cursor-pointer transition-colors duration-200 ${
        isSuccess ? "solid-slider-success" : "solid-slider-track"
      } ${className}`}
    >
      {/* Solid Red Fill that reveals cleanly behind the sliding thumb */}
      <div
        className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
        style={{
          width: isSuccess ? "100%" : `${currentTranslateX + thumbSize + 4}px`,
          backgroundColor: isSuccess ? "#15803D" : "#D93F3F",
          transition: isDragging ? "none" : "width 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Solid Center Text in Crisp Apple SF Pro Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-6">
        {isSuccess ? (
          <div className="flex items-center gap-2 text-white font-sf font-bold tracking-wider text-xs sm:text-sm animate-scale-up uppercase">
            <Check className="w-5 h-5 text-white stroke-[3]" />
            <span>Added to Cart</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 transition-opacity duration-150 pl-10"
            style={{
              opacity: Math.max(0, 1 - dragProgress * 1.6),
            }}
          >
            <span className="font-sf font-bold text-[11px] sm:text-[12px] tracking-wider uppercase text-[#3E2614]">
              Slide to Add to Cart
            </span>
            <div className="flex items-center -space-x-1 text-[#8C5D35]">
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        )}
      </div>

      {/* Draggable Solid White Circular Thumb Knob */}
      {!isSuccess && (
        <div
          ref={thumbRef}
          onPointerDown={handlePointerDown}
          style={{
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            top: "3px",
            left: "4px",
            transform: `translateX(${currentTranslateX}px)`,
            transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={`absolute rounded-full flex items-center justify-center z-20 cursor-grab active:cursor-grabbing select-none transition-transform solid-slider-thumb ${
            isDragging ? "scale-105" : "hover:scale-102"
          }`}
        >
          <div className="flex items-center justify-center text-[#D93F3F]">
            {dragProgress > 0.35 ? (
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            ) : (
              <ShoppingCart className="w-4.5 h-4.5 stroke-[2.5]" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
