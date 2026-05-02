import { GlassCard } from "../GlassCard";
import { Shimmer } from "./Shimmer";

export function KanbanSkeleton() {
  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden animate-fade-in">
      <div className="px-6 md:px-10 py-4 flex justify-between items-center border-b border-[var(--border-glass)]">
        <div className="space-y-2">
          <Shimmer className="h-7 w-40 rounded-md" />
          <Shimmer className="h-4 w-60 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-24 rounded-full" />
          <Shimmer className="h-9 w-32 rounded-full" />
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-6 md:px-10 pb-6 overflow-x-auto">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="w-80 flex-shrink-0 flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <Shimmer className="h-5 w-24 rounded-sm" />
              <Shimmer className="h-5 w-6 rounded-full" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((task) => (
                <GlassCard key={task} padding="sm" className="space-y-3">
                  <div className="flex justify-between">
                    <Shimmer className="h-3 w-12 rounded-full" />
                    <Shimmer className="h-4 w-4 rounded-full" />
                  </div>
                  <Shimmer className="h-4 w-full rounded-sm" />
                  <Shimmer className="h-4 w-2/3 rounded-sm" />
                  <div className="flex justify-between items-center pt-2">
                    <Shimmer className="h-4 w-20 rounded-sm" />
                    <Shimmer className="h-6 w-6 rounded-full" />
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
