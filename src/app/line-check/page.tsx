import type { Metadata } from "next";
import { lineCheck } from "@/content-line-check";
import { LineCheck } from "@/components/line-check/LineCheck";
import "./line-check.css";

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

export default function LineCheckPage() {
  return (
    <div className="page lc-page">
      <LineCheck />
    </div>
  );
}
