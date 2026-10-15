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
      onClick={(e) => {
        track(BOOKING_EVENT, { place });
        // The link opens a new tab and keeps focus here, so the focus ring is still
        // on the button when the reader comes back. A mouse click (detail > 0)
        // drops it; a keyboard activation (detail 0) keeps focus where it was.
        if (e.detail > 0) e.currentTarget.blur();
      }}
    >
      {label}
    </a>
  );
}
