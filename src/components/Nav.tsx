"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { nav, release } from "@/content";
import { Logo } from "@/components/Logo";
import { ChevronDownIcon, PinIcon } from "@/components/Icons";

/* The header turns into the compact teal bar after this much scroll */
const SCROLLED_AT = 24;

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > SCROLLED_AT;

/**
 * The Durango menu: a label with a location pin, not a link, because there is
 * no Durango page yet. Its pages drop down on hover or keyboard focus (CSS),
 * and on a click or tap (state), which is what touch screens get. Escape or
 * a click elsewhere closes a clicked-open menu.
 */
function DurangoMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  const { label, menuLabel, items } = nav.durango;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={open ? "nav__group nav__group--open" : "nav__group"}>
      <button
        type="button"
        className="nav__trigger"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <PinIcon />
        {label}
        <ChevronDownIcon />
      </button>
      <div className="nav__menu" id={menuId}>
        <ul aria-label={menuLabel}>
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Sticky header: the logo left, nav links, the Durango menu (while
 * release.showDurangoNav is true) and the sunflower CTA right. Once the page scrolls it becomes a short dark teal bar with the
 * simple white logo, and the link for the section in view turns sunflower.
 * It's fixed over a spacer of its full height, so the page doesn't move when
 * it shrinks. Below 900px only the logo and CTA remain.
 *
 * The links are anchors on the home page. On any other page (home false) they
 * point back to the home page's sections, the logo goes home, and the page
 * can pass its own CTA.
 */
export function Nav({ home = true, cta = nav.cta }: { home?: boolean; cta?: { label: string; href: string } }) {
  const [current, setCurrent] = useState<string | null>(null);
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => false);
  const base = home ? "" : "/";

  useEffect(() => {
    if (!home) return;
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
  }, [home]);

  return (
    <>
      <div className="nav-spacer" aria-hidden="true" />
      <header className={scrolled ? "nav nav--scrolled" : "nav"}>
        <Logo home={home} />
        <nav className="nav__links">
          {nav.links.map((link) => (
            <a key={link.href} href={`${base}${link.href}`} aria-current={current === link.href ? "location" : undefined}>
              {link.label}
            </a>
          ))}
          {release.showDurangoNav && <DurangoMenu />}
          <a href={cta.href} className="nav__cta">
            {cta.label}
          </a>
        </nav>
      </header>
    </>
  );
}
