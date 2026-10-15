/**
 * Analytics seam (BUILD.md, "Analytics").
 *
 * In development this logs to the console. In production it sends the event
 * to Umami (the script tag in app/layout.tsx) if its tracker is present, and
 * otherwise does nothing. Event names live in `analytics` in content.ts and
 * `events` in content-line-check.ts; the props (step number, verdict, where
 * a booking link was clicked) show up in Umami as event data.
 */

type EventProps = Record<string, string | number>;

type UmamiWindow = Window & {
  umami?: { track: (eventName: string, data?: EventProps) => void };
};

export function track(eventName: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[track] ${eventName}`, props ?? "");
    return;
  }

  const w = window as UmamiWindow;
  if (typeof w.umami?.track === "function") {
    if (props) w.umami.track(eventName, props);
    else w.umami.track(eventName);
  }
}
