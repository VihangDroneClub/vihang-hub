================================================================================
STEP 1 — KEYFRAMES IN globals.css
================================================================================

Add these keyframes to app/globals.css:

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(16px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 var(--accent-cyan-dim);
    }
    50% {
      box-shadow: 0 0 0 6px transparent;
    }
  }


================================================================================
STEP 2 — TAILWIND CUSTOM UTILITIES
================================================================================

In app/globals.css, inside @layer utilities, register these classes:

  @layer utilities {
    .animate-fadeUp {
      animation: fadeUp 350ms ease forwards;
    }
    .animate-fadeIn {
      animation: fadeIn 300ms ease forwards;
    }
    .animate-scaleIn {
      animation: scaleIn 200ms ease forwards;
    }
    .animate-slideInRight {
      animation: slideInRight 250ms ease forwards;
    }
    .animate-shimmer {
      animation: shimmer 1.8s infinite linear;
    }
    .animate-pulse-glow {
      animation: pulse-glow 600ms ease;
    }
  }


================================================================================
STEP 3 — REDUCED MOTION SAFETY NET
================================================================================

Add to app/globals.css:

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }


================================================================================
STEP 4 — ANIMATIONS UTILITY FILE
================================================================================

File: /lib/utils/animations.ts (create new)

Export a typed object of animation class names for use in components:

  export const animations = {
    fadeUp: "animate-fadeUp",
    fadeIn: "animate-fadeIn",
    scaleIn: "animate-scaleIn",
    slideInRight: "animate-slideInRight",
    shimmer: "animate-shimmer",
    pulseGlow: "animate-pulse-glow",
  } as const

  // Helper: stagger delay as inline style
  // Usage: style={staggerDelay(index)}
  export function staggerDelay(index: number, baseMs = 60): React.CSSProperties {
    return { animationDelay: `${Math.min(index * baseMs, 400)}ms` }
  }

  // Helper: one-shot animation class with delay
  export function withDelay(animClass: string, delayMs: number): string {
    return animClass  // delay applied via inline style separately
  }

Import React at the top: import type { CSSProperties } from 'react'


