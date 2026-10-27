import React, { useEffect, useRef, useState } from "react";

/**
 * ScrollReveal
 * Delivers satisfying scroll-triggered entrance animations with smooth liquid unblur and elevation.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  staggerIndex = 0,
  direction = "up", // "up" | "scale" | "fade"
  distance = 24,
  threshold = 0.12,
  style = {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check if IntersectionObserver is supported
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const totalDelayMs = delay + staggerIndex * 90;

  const getInitialTransform = () => {
    if (direction === "up") return `translate3d(0, ${distance}px, 0)`;
    if (direction === "scale") return `scale(0.94) translate3d(0, ${distance / 2}px, 0)`;
    return "none";
  };

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal-container ${className}`}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0, 0, 0) scale(1)" : getInitialTransform(),
        filter: isVisible ? "blur(0px)" : "blur(8px)",
        transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${totalDelayMs}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${totalDelayMs}ms, filter 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${totalDelayMs}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}
