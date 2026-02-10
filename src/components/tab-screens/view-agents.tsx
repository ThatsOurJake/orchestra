import { useMemo } from 'react';
import { AgentOverview } from '../agent-overview';
import { useAgents } from '../store';

export const ViewAgents = () => {
  const agents = useAgents();
  const sorted = useMemo(
    () => agents.sort((a, b) => a.name.localeCompare(b.name)),
    [agents],
  );

  if (!agents.length) {
    return (
      <div>
        <p className="text-center py-2 font-bold text-2xl">
          There are no agents - use the "Create" to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      {sorted.map((ag) => (
        <AgentOverview agent={ag} key={ag.id} />
      ))}
    </div>
  );
};
