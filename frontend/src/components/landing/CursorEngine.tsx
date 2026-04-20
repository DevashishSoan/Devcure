"use client";

import { useEffect, useRef } from "react";

export function CursorEngine() {
  const cursorRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      document.documentElement.style.setProperty("--scroll-y", `${window.scrollY * -0.5}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    const animate = () => {
      const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor;
      };

      // Calculate new position
      cursorRef.current.x = lerp(cursorRef.current.x, targetRef.current.x, 0.1);
      cursorRef.current.y = lerp(cursorRef.current.y, targetRef.current.y, 0.1);

      // Calculate velocity
      const dx = cursorRef.current.x - lastPosRef.current.x;
      const dy = cursorRef.current.y - lastPosRef.current.y;
      velocityRef.current = Math.sqrt(dx * dx + dy * dy);

      // Update CSS Variables
      document.documentElement.style.setProperty("--cursor-x", `${cursorRef.current.x}px`);
      document.documentElement.style.setProperty("--cursor-y", `${cursorRef.current.y}px`);
      document.documentElement.style.setProperty("--shimmer-pos", `${velocityRef.current * 2}% 0%`);

      // Hover feedback for custom cursor
      const cursorEl = document.querySelector('.custom-cursor') as HTMLElement;
      if (cursorEl) {
        const isHovering = document.querySelectorAll('button:hover, a:hover').length > 0;
        cursorEl.style.width = isHovering ? '64px' : '12px';
        cursorEl.style.height = isHovering ? '64px' : '12px';
        cursorEl.style.background = isHovering ? 'transparent' : 'var(--color-accent-primary)';
        cursorEl.style.border = isHovering ? '1px solid var(--color-accent-primary)' : 'none';
      }

      lastPosRef.current = { ...cursorRef.current };
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div className="custom-cursor" />
      <div className="prism-light" />
      <div className="vector-grid" />
      <div className="noise-overlay" />
    </>
  );
}
