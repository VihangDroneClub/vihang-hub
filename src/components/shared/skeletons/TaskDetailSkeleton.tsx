import { GlassCard } from "../GlassCard";
import { Shimmer } from "./Shimmer";

export function TaskDetailSkeleton() {
  return (
    <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shimmer className="h-6 w-20 rounded-full" />
            <Shimmer className="h-6 w-24 rounded-full" />
          </div>
          <Shimmer className="h-10 w-full rounded-md" />
          <div className="flex gap-4">
            <Shimmer className="h-5 w-32 rounded-sm" />
            <Shimmer className="h-5 w-32 rounded-sm" />
          </div>
        </div>

        <div className="space-y-4">
          <Shimmer className="h-6 w-32 rounded-md" />
          <div className="space-y-2">
            <Shimmer className="h-4 w-full rounded-sm" />
            <Shimmer className="h-4 w-full rounded-sm" />
            <Shimmer className="h-4 w-2/3 rounded-sm" />
          </div>
        </div>

        <div className="space-y-6 pt-8 border-t border-[var(--border-glass)]">
          <Shimmer className="h-6 w-40 rounded-md" />
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
              <GlassCard className="flex-1" padding="sm">
                <div className="flex justify-between mb-2">
                  <Shimmer className="h-4 w-32 rounded-sm" />
                  <Shimmer className="h-3 w-20 rounded-sm" />
                </div>
                <Shimmer className="h-4 w-full rounded-sm" />
              </GlassCard>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <GlassCard className="space-y-6">
          <div className="space-y-3">
            <Shimmer className="h-4 w-20 rounded-sm" />
            <div className="flex items-center gap-3">
              <Shimmer className="h-8 w-8 rounded-full" />
              <Shimmer className="h-4 w-32 rounded-sm" />
            </div>
          </div>
          <div className="space-y-3">
            <Shimmer className="h-4 w-20 rounded-sm" />
            <Shimmer className="h-6 w-32 rounded-full" />
          </div>
          <div className="space-y-3">
            <Shimmer className="h-4 w-20 rounded-sm" />
            <Shimmer className="h-6 w-32 rounded-md" />
          </div>
          <div className="h-px bg-[var(--border-glass)]" />
          <div className="space-y-3">
            <Shimmer className="h-4 w-24 rounded-sm" />
            <div className="flex flex-wrap gap-2">
              <Shimmer className="h-6 w-16 rounded-full" />
              <Shimmer className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
