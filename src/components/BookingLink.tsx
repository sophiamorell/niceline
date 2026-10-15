"use client";

import { analytics, site } from "@/content";
import { track } from "@/lib/track";

const BOOKING_EVENT = analytics.v1[3]; // booking_click

/**
 * The booking link: site.bookingUrl in a new tab, firing booking_click with
 * where it was clicked. Renders nothing while bookingUrl is null, so every
 * placement (hero, step strip, footer) disappears together if the link is
 * ever taken down.
 */
export function BookingLink({
  place,
  className,
  label = site.bookingLabelShort,
}: {
  place: "hero" | "steps" | "footer";
  className: string;
  label?: string;
}) {
  if (site.bookingUrl === null) return null;
  return (
    <a
      href={site.bookingUrl}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track(BOOKING_EVENT, { place })}
    >
      {label}
    </a>
  );
}
