import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: "cyan" | "tesseract" | "avinya" | "other" | "none"
  hoverable?: boolean
  padding?: "none" | "sm" | "md" | "lg"
  style?: React.CSSProperties
}

/**
 * GlassCard - The primary container component for the Vihang Hub UI.
 * Implements a "Mission Control" dark glassmorphism aesthetic.
 */
export const GlassCard = ({
  children,
  className,
  glow = "none",
  hoverable = false,
  padding = "md",
  style
}: GlassCardProps) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-[12px]",
    md: "p-[20px]",
    lg: "p-[32px]",
  };

  const glowStyles = {
    cyan: "shadow-[0_0_0_1px_var(--accent-cyan-dim),0_4px_24px_var(--accent-cyan-glow)]",
    tesseract: "shadow-[0_0_0_1px_var(--mission-tesseract-glow),0_4px_24px_var(--mission-tesseract-glow)]",
    avinya: "shadow-[0_0_0_1px_var(--mission-avinya-glow),0_4px_24px_var(--mission-avinya-glow)]",
    other: "shadow-[0_0_0_1px_var(--mission-other-glow),0_4px_24px_var(--mission-other-glow)]",
    none: "",
  };

  const hoverStyles = hoverable ? cn(
    "cursor-pointer transition-all duration-200 hover:-translate-y-[2px]",
    glow === "cyan" && "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.30),0_4px_24px_rgba(34,211,238,0.16)]",
    glow === "tesseract" && "hover:shadow-[0_0_0_1px_rgba(99,102,241,0.30),0_4px_24px_rgba(99,102,241,0.30)]",
    glow === "avinya" && "hover:shadow-[0_0_0_1px_rgba(16,185,129,0.30),0_4px_24px_rgba(16,185,129,0.30)]",
    glow === "other" && "hover:shadow-[0_0_0_1px_rgba(245,158,11,0.30),0_4px_24px_rgba(245,158,11,0.30)]"
  ) : "";

  return (
    <div 
      style={{ 
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        ...style
      }}
      className={cn(
        "bg-[var(--bg-glass)] border border-[var(--border-glass)] rounded-[var(--radius-lg)] relative overflow-hidden",
        paddingStyles[padding],
        glowStyles[glow],
        hoverStyles,
        className
      )}
    >
      {/* Inner Shine Effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)'
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
