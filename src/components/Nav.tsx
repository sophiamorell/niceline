"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { nav } from "@/content";
import { Logo } from "@/components/Logo";

/* The header turns into the compact ink bar after this much scroll */
const SCROLLED_AT = 24;

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > SCROLLED_AT;

/**
 * Sticky header: the logo left, nav links and the sunflower CTA right.
 * The link for the section in view is marked current and sits on the
 * highlighter band. Once the page scrolls it becomes a short ink bar with
 * the simple white logo. Below 900px only the logo and CTA remain.
 */
export function Nav() {
  const [current, setCurrent] = useState<string | null>(null);
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => false);

  useEffect(() => {
    const sections = nav.links
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={scrolled ? "nav nav--scrolled" : "nav"}>
      <Logo />
      <nav className="nav__links">
        {nav.links.map((link) => (
          <a key={link.href} href={link.href} aria-current={current === link.href ? "location" : undefined}>
            {link.label}
          </a>
        ))}
        <a href={nav.cta.href} className="nav__cta">
          {nav.cta.label}
        </a>
      </nav>
    </header>
  );
}
