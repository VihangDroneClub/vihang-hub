import { GlassCard } from "../GlassCard";
import { Shimmer } from "./Shimmer";

export function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <Shimmer className="h-8 w-48 rounded-md" />
        <Shimmer className="h-4 w-64 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} padding="md" className="space-y-4">
            <div className="flex justify-between items-start">
              <Shimmer className="h-6 w-32 rounded-md" />
              <Shimmer className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-3 w-8" />
              </div>
              <Shimmer className="h-2 w-full rounded-full" />
            </div>
            <div className="flex gap-2">
              <Shimmer className="h-4 w-12 rounded-full" />
              <Shimmer className="h-4 w-12 rounded-full" />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 h-[400px]">
          <div className="mb-6">
            <Shimmer className="h-6 w-40 rounded-md" />
          </div>
          <div className="h-[300px] w-full relative">
            <Shimmer className="absolute inset-0 rounded-lg" />
          </div>
        </GlassCard>
        <GlassCard className="h-[400px] flex flex-col">
          <Shimmer className="h-6 w-32 mb-6 rounded-md" />
          <div className="space-y-4 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Shimmer className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Shimmer className="h-3 w-full rounded-sm" />
                  <Shimmer className="h-2 w-24 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
