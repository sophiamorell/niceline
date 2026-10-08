/**
 * Line Check icons: Lucide (ISC license) paths drawn inline in the current
 * text colour, functional only. Same approach as src/components/Icons.tsx.
 */

import type { ReactNode } from "react";

function Lucide({ size = 20, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const MicIcon = ({ size }: { size?: number }) => (
  <Lucide size={size}>
    <path d="M12 19v3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <rect x="9" y="2" width="6" height="13" rx="3" />
  </Lucide>
);

export const StopIcon = ({ size }: { size?: number }) => (
  <Lucide size={size}>
    <rect width="14" height="14" x="5" y="5" rx="2" />
  </Lucide>
);

export const ArrowLeftIcon = () => (
  <Lucide size={18}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Lucide>
);

export const ArrowRightIcon = () => (
  <Lucide size={18}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Lucide>
);

export const PlusIcon = () => (
  <Lucide size={18}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Lucide>
);

export const LinkIcon = () => (
  <Lucide size={18}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Lucide>
);

export const DownloadIcon = () => (
  <Lucide size={18}>
    <path d="M12 15V3" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
  </Lucide>
);

export const RotateIcon = () => (
  <Lucide size={16}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Lucide>
);

export const SpinnerIcon = () => (
  <span className="lc-spin">
    <Lucide size={20}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </Lucide>
  </span>
);

export const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
