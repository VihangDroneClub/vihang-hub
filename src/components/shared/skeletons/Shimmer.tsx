import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "animate-shimmer bg-[var(--bg-elevated)] opacity-20", 
        className
      )} 
    />
  );
}
