import { GlassCard } from "../GlassCard";
import { Shimmer } from "./Shimmer";

export function MissionListSkeleton() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Shimmer className="h-8 w-48 rounded-md" />
          <Shimmer className="h-4 w-64 rounded-md" />
        </div>
        <Shimmer className="h-10 w-32 rounded-full hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GlassCard key={i} className="h-48 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Shimmer className="h-6 w-32 rounded-md" />
                <Shimmer className="h-6 w-6 rounded-full" />
              </div>
              <Shimmer className="h-3 w-full rounded-sm" />
              <Shimmer className="h-3 w-2/3 rounded-sm" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((j) => (
                  <Shimmer key={j} className="h-6 w-6 rounded-full border border-[var(--bg-surface)]" />
                ))}
              </div>
              <Shimmer className="h-4 w-16 rounded-sm" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
