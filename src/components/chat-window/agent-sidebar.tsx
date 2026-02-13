import type { StoreAgent } from './chat-window-store';

interface AgentButtonProps {
  state: StoreAgent['state'];
  agentName: string;
  onClick: () => void;
}

const AgentButton = ({ state, agentName, onClick }: AgentButtonProps) => {
  return (
    <button
      type="button"
      data-state={state}
      onClick={onClick}
      className="border w-full py-1 cursor-pointer hover:underline rounded data-[state=working]:bg-green-100 data-[state=working]:border-green-300 data-[state=idle]:bg-orange-100 data-[state=idle]:border-orange-300 data-[state=loading]:bg-pink-100 data-[state=loading]:border-pink-300"
    >
      {agentName}
    </button>
  );
};

interface AgentSidebarProps {
  activeAgents: StoreAgent[];
  onButtonClick: (id: string) => void;
}

const StateLegend = () => {
  return (
    <div className="ml-2 p-2 my-2 border border-gray-300 rounded bg-gray-50">
      <p className="text-sm font-semibold mb-2">Agent States</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#FFC0CB' }}
          />
          <span className="text-xs">Loading</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#FFA500' }}
          />
          <span className="text-xs">Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#00FF00' }}
          />
          <span className="text-xs">Working</span>
        </div>
      </div>
    </div>
  );
};

export const AgentSidebar = ({
  activeAgents,
  onButtonClick,
}: AgentSidebarProps) => {
  return (
    <>
      <p className="text-center">Active Agents</p>
      <StateLegend />
      <ul className="px-2 space-y-2 my-2">
        <li>
          <button
            type="button"
            className="border w-full py-1 cursor-pointer hover:underline rounded bg-blue-100 border-blue-300"
            onClick={() => onButtonClick('default')}
          >
            Main Window
          </button>
        </li>
        {activeAgents.map((agent) => (
          <AgentButton
            agentName={agent.agentName}
            key={`agent-${agent.agentFlowId}`}
            state={agent.state}
            onClick={() => onButtonClick(agent.agentFlowId)}
          />
        ))}
      </ul>
    </>
  );
};
