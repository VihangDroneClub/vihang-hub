import Link from 'next/link';

interface MissionCardProps {
  mission: {
    id: string;
    name: string;
    status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
    deadline: string;
    owner: { name: string };
    campaign: { name: string };
    tasks: { status: string }[];
  };
}

export function MissionCard({ mission }: MissionCardProps) {
  const statusColors = {
    not_started: 'bg-gray-200',
    in_progress: 'bg-blue-500',
    blocked: 'bg-red-500',
    completed: 'bg-green-500',
  };

  const completedTasks = mission.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = mission.tasks.length;

  return (
    <Link href={`/missions/${mission.id}`} className="block min-h-[44px]">
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[mission.status] || 'bg-gray-200'}`} />
          <span className="text-sm text-gray-600">{mission.campaign.name}</span>
        </div>
        
        {/* Mission name */}
        <h3 className="text-xl font-semibold mb-2">{mission.name}</h3>
        
        {/* Owner */}
        <p className="text-sm text-gray-600 mb-2">
          Owner: {mission.owner?.name || 'Unassigned'}
        </p>
        
        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(completedTasks/totalTasks)*100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Deadline */}
        {mission.deadline && (
          <p className="text-sm text-gray-500">
            Due: {new Date(mission.deadline).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}
