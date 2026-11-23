"use client";

import type { ReactNode } from "react";
import { openContact } from "@/lib/contact-modal";

/** A button that opens the contact popup (the closing card's "Send Sophie a message"). */
export function MessageButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openContact()}>
      {children}
    </button>
  );
}
