"use client";

import { useEffect, useState } from "react";
import { nav } from "@/content";
import { Logo } from "@/components/Logo";

/**
 * Sticky header: the logo left, nav links and the sunflower CTA right.
 * The link for the section in view is marked current and underlined with a
 * small pink swash. Below 900px only the logo and CTA remain.
 */
export function Nav() {
  const [current, setCurrent] = useState<string | null>(null);

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
    <header className="nav">
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
