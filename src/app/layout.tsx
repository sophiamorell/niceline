import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Lato, Libre_Franklin, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/content";

/* The design system's four faces (all Google Fonts, OFL), self-hosted by
   next/font and subset to latin:
   FM Slab  = Alfa Slab One 400   (tool numerals and quote marks only)
   FM Head  = Montserrat 600/700/800 (headings, nav, buttons)
   FM Body  = Lato 400/700        (body copy)
   FM Label = Libre Franklin 600  (uppercase kickers and labels) */
const slab = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-slab",
  fallback: ["Georgia", "serif"],
});

const head = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-head",
  fallback: ["system-ui", "sans-serif"],
});

const body = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-body",
  fallback: ["system-ui", "sans-serif"],
});

const label = Libre_Franklin({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-label",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: site.title,
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f6f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${slab.variable} ${head.variable} ${body.variable} ${label.variable}`}>
      <body>{children}</body>
    </html>
  );
}
