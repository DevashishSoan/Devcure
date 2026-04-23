"use client";

import { useEffect } from "react";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { LogosStrip } from "@/components/landing/LogosStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Metrics } from "@/components/landing/Metrics";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el, i) => {
      // Stagger the initial load
      if (el.getBoundingClientRect().top < window.innerHeight) {
        setTimeout(() => el.classList.add("visible"), i * 100);
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--void)] text-[var(--text-primary)] pt-24">
      <Nav />
      <Hero />
      <LogosStrip />
      <HowItWorks />
      <FeaturesGrid />
      <Metrics />
      <Testimonials />
      <Pricing />
      <CTASection />
      <Footer />
    </main>
  );
}
