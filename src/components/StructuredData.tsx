import { structuredDataJson } from "@/lib/structured-data";

/** The home page's JSON-LD (business, Sophie, FAQ), one script tag in the body. */
export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson() }} />;
}
