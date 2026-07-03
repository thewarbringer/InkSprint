import { useEffect, useRef } from "react";

/**
 * Returns a ref to attach to the glow element. Position updates are applied
 * directly to the DOM node's style, sidestepping React re-renders on every
 * mousemove for smooth 60fps tracking.
 */
export default function useCursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    function handleMove(e) {
      const el = glowRef.current;
      if (!el) return;
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return glowRef;
}
