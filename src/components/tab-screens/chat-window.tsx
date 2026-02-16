import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/shallow';
import type {
  AgentResponseEvent,
  AgentStateEvent,
  AgentWorkingStateEvent,
  CreateAgentEvent,
  EndEvent,
  OutputEvent,
} from '../../machine';
import { AgentSidebar } from '../chat-window/agent-sidebar';
import { useChatWindowStore } from '../chat-window/chat-window-store';
import { CWMainScreen } from '../chat-window/screens/main';
import { useInputModalStore } from '../input-modal/input-modal-store';
import { type MainStore, type StoredFlow, useStore } from '../store';

const selector = (state: MainStore) => ({
  storedFlows: state.storedFlows,
  addChatHistory: state.addChatHistory,
});

interface CreationWindowProps {
  autoLoadFlowId?: string | null;
}

export const CreationWindow = ({ autoLoadFlowId }: CreationWindowProps) => {
  const { storedFlows, addChatHistory } = useStore(useShallow(selector));
  const {
    getMachine,
    machineId,
    activeAgents,
    activeTab,
    chatState,
    loadedFlow,
    mainOutputs,
    flowError,
    addAgent,
    updateAgentWorkingState,
    updateAgentState,
    addAgentOutput,
    setActiveTab,
    setChatState,
    setLoadedFlow,
    createMachine,
    addMainOutput,
    setFlowError,
    reset,
  } = useChatWindowStore();
  const { openModal } = useInputModalStore();

  const onSidebarClick = useCallback(
    (id: string) => {
      setActiveTab(id);
    },
    [setActiveTab],
  );

  // Set up Machine event listeners
  useEffect(() => {
    const machine = getMachine();

    if (!machine) {
      console.log('[Effect] No machine yet, machineId:', machineId);
      return;
    }

    console.log(
      '[Effect] Setting up event listeners for machineId:',
      machineId,
    );

    const onCreateAgent = (event: CreateAgentEvent) => {
      const { agentFlowId, agentName } = event.data;
      addAgent(agentFlowId, agentName);
    };

    const onOutput = (event: OutputEvent) => {
      addMainOutput(event.data.content);
    };

    const onEnd = (event: EndEvent) => {
      if (event.data.err) {
        const errorMessage = `Error in node ${event.data.err.nodeId}: ${event.data.err.message}`;
        console.error(errorMessage);
        setFlowError(errorMessage);
      } else {
        // Only save to history if there was no error
        if (loadedFlow && mainOutputs.length > 0) {
          addChatHistory({
            flowName: loadedFlow.name,
            outputs: mainOutputs.map((output) => ({
              content: output.content,
              timestamp: output.timestamp,
            })),
          });
        }
      }

      setChatState('ended');
    };

    const onAgentResponse = (event: AgentResponseEvent) => {
      const { agentFlowId, agentName, response } = event.data;

      // Ensure agent exists in store
      addAgent(agentFlowId, agentName);

      // Add the response to the agent's outputs
      addAgentOutput(agentFlowId, response);
    };

    const onAgentWorkingState = (event: AgentWorkingStateEvent) => {
      const { agentFlowId, agentName, isWorking } = event.data;

      // Ensure agent exists in store
      addAgent(agentFlowId, agentName);

      // Update working state
      updateAgentWorkingState(agentFlowId, isWorking);
    };

    const onAgentState = (event: AgentStateEvent) => {
      const { agentFlowId, agentName, state } = event.data;

      // Ensure agent exists in store
      addAgent(agentFlowId, agentName);

      // Update agent state
      updateAgentState(agentFlowId, state);
    };

    machine.addEventListener('createAgent', onCreateAgent);
    machine.addEventListener('output', onOutput);
    machine.addEventListener('end', onEnd);
    machine.addEventListener('agentResponse', onAgentResponse);
    machine.addEventListener('agentWorkingState', onAgentWorkingState);
    machine.addEventListener('agentState', onAgentState);

    return () => {
      machine.removeEventListener('createAgent', onCreateAgent);
      machine.removeEventListener('output', onOutput);
      machine.removeEventListener('end', onEnd);
      machine.removeEventListener('agentResponse', onAgentResponse);
      machine.removeEventListener('agentWorkingState', onAgentWorkingState);
      machine.removeEventListener('agentState', onAgentState);
    };
  }, [
    machineId,
    getMachine,
    addAgent,
    addAgentOutput,
    addMainOutput,
    setChatState,
    setFlowError,
    updateAgentWorkingState,
    updateAgentState,
    loadedFlow,
    mainOutputs,
    addChatHistory,
  ]);

  // Handle parameter collection and Machine creation
  useEffect(() => {
    if (chatState !== 'waiting-for-parameters' || !loadedFlow) {
      return;
    }

    const collectParameters = async () => {
      const { nodes } = loadedFlow;
      const startingNode = nodes.find((x) => x.type === 'parameters');

      if (!startingNode) {
        setFlowError('No parameters node found in flow');
        setChatState('ended');
        return;
      }

      const {
        data: { params = [] },
      } = startingNode;

      const inputParams: Record<string, unknown> = {};

      if (params.length > 0) {
        for (const param of params) {
          const result = await openModal({
            title: 'Parameter Input',
            label: `Enter value for: "${param.name}"`,
          });

          if (!result) {
            toast('User cancelled inputting parameters. Not executing flow', {
              type: 'warning',
            });
            setChatState('not-started');
            return;
          }

          inputParams[param.name] = result;
        }
      }

      // Create the machine with the collected parameters
      await createMachine(inputParams);
      setChatState('in-progress');
    };

    collectParameters();
  }, [
    chatState,
    loadedFlow,
    openModal,
    setChatState,
    createMachine,
    setFlowError,
  ]);

  // Start the Machine once it's created
  useEffect(() => {
    const machine = getMachine();

    if (!machine || chatState !== 'in-progress') {
      return;
    }

    const startMachine = async () => {
      try {
        await machine.start();
      } catch (error) {
        const err = error as Error;
        setFlowError(`Machine error: ${err.message}`);
        setChatState('ended');
      }
    };

    startMachine();
    // machineId is needed to trigger re-run when machine is created
  }, [getMachine, chatState, setChatState, setFlowError]);

  const startFlow = useCallback(
    (flow: StoredFlow) => {
      // Reset previous state
      reset();

      // Load the new flow
      setLoadedFlow(flow);
      setChatState('waiting-for-parameters');
    },
    [reset, setLoadedFlow, setChatState],
  );

  // Auto-load flow if flowId is provided via deep link
  useEffect(() => {
    if (autoLoadFlowId && chatState === 'not-started') {
      const flow = storedFlows.find((f) => f.id === autoLoadFlowId);
      if (flow) {
        startFlow(flow);
      }
    }
  }, [autoLoadFlowId, chatState, storedFlows, startFlow]);

  return (
    <div className="flex h-full w-full">
      <div className="h-full grow shrink overflow-hidden pr-2">
        <CWMainScreen
          selectedTab={activeTab}
          storedFlows={storedFlows}
          chatState={chatState}
          mainOutputs={mainOutputs}
          flowError={flowError}
          activeAgents={activeAgents}
          flowName={loadedFlow?.name || 'Unknown Flow'}
          onFlowSelect={startFlow}
          onReset={reset}
        />
      </div>
      <div className="w-1/5 shrink-0 h-full overflow-hidden border-l border-black">
        <AgentSidebar
          activeAgents={activeAgents}
          onButtonClick={onSidebarClick}
        />
      </div>
    </div>
  );
};
