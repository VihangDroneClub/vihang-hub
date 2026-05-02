import Link from 'next/link';

interface MissionCardProps {
  mission: {
    id: string;
    name: string;
    status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
    deadline: string;
    owner: { name: string } | null;
    campaign: { name: string } | null;
    tasks: { status: string }[];
  };
}

export function MissionCard({ mission }: MissionCardProps) {
  const statusStyles = {
    not_started: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Started', ring: 'ring-gray-200' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress', ring: 'ring-blue-200' },
    blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked', ring: 'ring-red-200' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', ring: 'ring-green-200' },
  };

  const currentStatus = statusStyles[mission.status] || statusStyles.not_started;

  const completedTasks = mission.tasks ? mission.tasks.filter(t => t.status === 'completed').length : 0;
  const totalTasks = mission.tasks ? mission.tasks.length : 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Link href={`/missions/${mission.id}`} className="block h-full group">
      <div className="h-full flex flex-col border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white hover:border-blue-200 relative overflow-hidden">
        
        {/* Top bar: Campaign and Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase mb-1">
              {mission.campaign?.name || 'Uncategorized'}
            </span>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
              {mission.name}
            </h3>
          </div>
        </div>
        
        {/* Badges and Owner */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${currentStatus.bg} ${currentStatus.text} ${currentStatus.ring}`}>
            {currentStatus.label}
          </span>

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            {mission.owner ? (
              <>
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
                  {mission.owner.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[120px]">{mission.owner.name}</span>
              </>
            ) : (
              <span className="italic text-gray-400">Unassigned</span>
            )}
          </div>
        </div>
        
        {/* Spacer to push bottom content down */}
        <div className="flex-grow"></div>

        {/* Progress and Deadline */}
        <div className="pt-4 border-t border-gray-100">
          {totalTasks > 0 ? (
            <div className="mb-3">
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                <span>Task Progress</span>
                <span className={progressPercent === 100 ? 'text-green-600' : ''}>
                  {completedTasks}/{totalTasks} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-3 text-xs text-gray-400 italic">No tasks assigned yet</div>
          )}
          
          {mission.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due: {new Date(mission.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
