import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Space_Mono } from "next/font/google";
import { lineCheck } from "@/content-line-check";
import { LineCheck } from "@/components/line-check/LineCheck";
import "./line-check.css";

/* The Groovy theme's faces (handoff: "Theme"). Alfa Slab One, the display
   face, already comes from the root layout as --font-slab. */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-hanken",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "monospace"],
});

/**
 * /line-check: the Line Check lead magnet. A prototype for testing with a few
 * founders, so it isn't linked from the site nav and asks search engines not
 * to index it.
 */
export const metadata: Metadata = {
  title: lineCheck.meta.title,
  description: lineCheck.meta.description,
  openGraph: { title: lineCheck.meta.title, description: lineCheck.meta.description },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f0eae1",
};

export default function LineCheckPage() {
  return (
    <div className={`${hanken.variable} ${spaceMono.variable}`}>
      <LineCheck />
    </div>
  );
}
