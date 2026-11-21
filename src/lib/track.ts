/**
 * Analytics seam (BUILD.md, "Analytics").
 *
 * In development this logs to the console. In production it sends the event
 * to both trackers loaded in app/layout.tsx, skipping either one that isn't
 * present: Umami, and Google Analytics 4 through the Google tag. Event names
 * live in `analytics` in content.ts and `events` in content-line-check.ts;
 * the props (step number, verdict, where a booking link was clicked) show up
 * as event data in Umami and as event parameters in GA4.
 */

type EventProps = Record<string, string | number>;

type AnalyticsWindow = Window & {
  umami?: { track: (eventName: string, data?: EventProps) => void };
  gtag?: (command: "event", eventName: string, params?: EventProps) => void;
};

export function track(eventName: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[track] ${eventName}`, props ?? "");
    return;
  }

  const w = window as AnalyticsWindow;

  if (typeof w.umami?.track === "function") {
    if (props) w.umami.track(eventName, props);
    else w.umami.track(eventName);
  }

  if (typeof w.gtag === "function") {
    if (props) w.gtag("event", eventName, props);
    else w.gtag("event", eventName);
  }
}
