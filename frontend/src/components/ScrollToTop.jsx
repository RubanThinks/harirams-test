import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * On every route change, scroll the window to top — unless the URL includes
 * an in-page hash (e.g. "/#products") which should be honoured for anchor jumps.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}
