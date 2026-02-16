import { OutputDisplay } from '../../output-display';
import type { StoredFlow } from '../../store';
import type { ChatStates, MainOutput, StoreAgent } from '../chat-window-store';
import { FlowSelection } from './flow-selection';
import { CWScreenWrapper } from './wrapper';

interface CWMainScreenProps {
  selectedTab: string;
  storedFlows: StoredFlow[];
  chatState: ChatStates;
  mainOutputs: MainOutput[];
  flowError: string | null;
  activeAgents: StoreAgent[];
  flowName: string;
  onFlowSelect: (flow: StoredFlow) => void;
  onReset: () => void;
}

const MainOutputDisplay = ({
  outputs,
  error,
  flowName,
  onReset,
  chatState,
}: {
  outputs: MainOutput[];
  error: string | null;
  flowName: string;
  onReset: () => void;
  chatState: ChatStates;
}) => {
  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Flow Output [{flowName}]</h2>
        <button
          onClick={onReset}
          disabled={chatState !== 'ended'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          type="button"
        >
          Reset Chat
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <OutputDisplay outputs={outputs} />

      {chatState === 'ended' && !error && (
        <p className="text-center py-2 text-sm font-bold">Flow has finished</p>
      )}
    </div>
  );
};

const AgentOutputDisplay = ({ agent }: { agent: StoreAgent }) => {
  const getStateDisplay = () => {
    switch (agent.state) {
      case 'working':
        return '🟢 Working';
      case 'loading':
        return '🩷 Loading';
      default:
        return '🟠 Idle';
    }
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">
        {agent.agentName}
        <span className="ml-2 text-sm font-normal">({getStateDisplay()})</span>
      </h2>

      <div className="flex-1 space-y-3">
        {agent.outputs.length === 0 && (
          <p className="text-gray-500 italic">No outputs yet...</p>
        )}

        {agent.outputs.map((output, index) => (
          <div
            key={`agent-output-${output.timestamp}-${index}`}
            className="bg-blue-50 border border-blue-300 p-3 rounded"
          >
            <p className="whitespace-pre-wrap">{output.response}</p>
            <span className="text-xs text-blue-600 mt-2 block">
              {new Date(output.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CWMainScreen = ({
  selectedTab,
  storedFlows,
  chatState,
  mainOutputs,
  flowError,
  activeAgents,
  flowName,
  onFlowSelect,
  onReset,
}: CWMainScreenProps) => {
  // Find the selected agent if an agent tab is selected
  const selectedAgent = activeAgents.find(
    (agent) => agent.agentFlowId === selectedTab,
  );

  return (
    <>
      {/* Default/Main tab */}
      <CWScreenWrapper
        selectedTab="default"
        isVisible={selectedTab === 'default'}
      >
        {chatState === 'not-started' && (
          <FlowSelection
            storedFlows={storedFlows}
            onFlowSelect={onFlowSelect}
          />
        )}

        {(chatState === 'in-progress' || chatState === 'ended') && (
          <MainOutputDisplay
            outputs={mainOutputs}
            error={flowError}
            flowName={flowName}
            onReset={onReset}
            chatState={chatState}
          />
        )}

        {chatState === 'waiting-for-parameters' && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 italic">Collecting parameters...</p>
          </div>
        )}
      </CWScreenWrapper>

      {/* Agent tabs */}
      {selectedAgent && (
        <CWScreenWrapper
          selectedTab={selectedAgent.agentFlowId}
          isVisible={selectedTab === selectedAgent.agentFlowId}
        >
          <AgentOutputDisplay agent={selectedAgent} />
        </CWScreenWrapper>
      )}
    </>
  );
};
