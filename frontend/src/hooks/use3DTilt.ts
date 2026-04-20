"use client";

import { useState, useCallback, useRef } from "react";

interface TiltOptions {
  max?: number;
  perspective?: number;
  scale?: number;
  transitionDuration?: number;
}

export const use3DTilt = (options: TiltOptions = {}) => {
  const {
    max = 15,
    scale = 1.02,
  } = options;

  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)"
  });

  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -max;
    const rotateY = ((x - centerX) / centerX) * max;

    // Parallax factor for inner elements
    const parallaxX = ((x - centerX) / centerX) * 10;
    const parallaxY = ((y - centerY) / centerY) * 10;

    setStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: "none" // Disable transition during mouse move for responsiveness
    });

    setParallaxOffset({ x: parallaxX, y: parallaxY });
  }, [max, scale]);

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)"
    });
    setParallaxOffset({ x: 0, y: 0 });
  }, []);

  return {
    cardRef,
    style,
    parallaxOffset,
    onMouseMove,
    onMouseLeave
  };
};
