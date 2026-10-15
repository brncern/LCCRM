import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, strokeWidth = 1.9): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
}

export function IconScale({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size, 2)} {...p}>
      <path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z" />
    </svg>
  );
}

export function IconGrid({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function IconInbox({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export function IconColumns({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="10" y="4" width="5" height="11" rx="1.5" />
      <rect x="17" y="4" width="4" height="7" rx="1.5" />
    </svg>
  );
}

export function IconMegaphone({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
      <path d="M15 9a3 3 0 0 1 0 6" />
      <path d="M18 6a7 7 0 0 1 0 12" />
    </svg>
  );
}

export function IconShare({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

export function IconPulse({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function IconSearch({ size = 15, ...p }: IconProps) {
  return (
    <svg {...base(size, 2.2)} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function IconPlus({ size = 14, ...p }: IconProps) {
  return (
    <svg {...base(size, 2.8)} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconArrowUp({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size, 2.6)} {...p}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function IconWarning({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size, 2.2)} {...p}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

export function IconExternal({ size = 12, ...p }: IconProps) {
  return (
    <svg {...base(size, 2.6)} {...p}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
