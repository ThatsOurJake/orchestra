import { useCallback, useEffect } from 'react';
import { useBlocker } from 'react-router';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/shallow';
import type {
  AgentResponseEvent,
  AgentStateEvent,
  AgentWorkingStateEvent,
  AskForInputEvent,
  ConfirmOutputEvent,
  CreateAgentEvent,
  EndEvent,
  OutputEvent,
} from '../../machine';
import { AgentSidebar } from '../chat-window/agent-sidebar';
import { useChatWindowStore } from '../chat-window/chat-window-store';
import { CWMainScreen } from '../chat-window/screens/main';
import { useInputModalStore } from '../input-modal/input-modal-store';
import { useReviewModalStore } from '../review-modal/review-modal-store';
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
  const { openModal: openReviewModal } = useReviewModalStore();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (chatState === 'in-progress' || chatState === 'waiting-for-parameters') &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const shouldLeave = window.confirm(
        'A flow is currently running. Are you sure you want to leave? All progress will be lost.',
      );

      if (shouldLeave) {
        reset();
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, reset]);

  const onSidebarClick = useCallback(
    (id: string) => {
      setActiveTab(id);
    },
    [setActiveTab],
  );

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
      addMainOutput(event.data.content, event.data.level);
    };

    const onEnd = (event: EndEvent) => {
      if (event.data.err) {
        const errorMessage = `Error in node ${event.data.err.nodeId}: ${event.data.err.message}`;
        console.error(errorMessage);
        setFlowError(errorMessage);
      } else {
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
      addAgent(agentFlowId, agentName);
      addAgentOutput(agentFlowId, response);
    };

    const onAgentWorkingState = (event: AgentWorkingStateEvent) => {
      const { agentFlowId, agentName, isWorking } = event.data;
      addAgent(agentFlowId, agentName);
      updateAgentWorkingState(agentFlowId, isWorking);
    };

    const onAgentState = (event: AgentStateEvent) => {
      const { agentFlowId, agentName, state } = event.data;
      addAgent(agentFlowId, agentName);
      updateAgentState(agentFlowId, state);
    };

    const onAskForInput = async (event: AskForInputEvent) => {
      const { nodeId, question } = event.data;

      const userInput = await openModal({
        title: 'Input Required',
        label: question,
      });

      if (!userInput) {
        toast('User cancelled input. Flow cannot continue.', {
          type: 'warning',
        });
        machine.triggerEnd({
          message: 'User cancelled input',
          nodeId,
        });
        return;
      }

      await machine.provideInput(nodeId, userInput);
    };

    const onConfirmOutput = async (event: ConfirmOutputEvent) => {
      const { nodeId, label, content } = event.data;

      const result = await openReviewModal({ label, content });

      if (result === null) {
        machine.triggerEnd({
          message: 'User dismissed the review dialog. Flow cannot continue.',
          nodeId,
        });
        return;
      }

      await machine.provideConfirmation(nodeId, result);
    };

    machine.addEventListener('createAgent', onCreateAgent);
    machine.addEventListener('output', onOutput);
    machine.addEventListener('end', onEnd);
    machine.addEventListener('agentResponse', onAgentResponse);
    machine.addEventListener('agentWorkingState', onAgentWorkingState);
    machine.addEventListener('agentState', onAgentState);
    machine.addEventListener('askForInput', onAskForInput);
    machine.addEventListener('confirmOutput', onConfirmOutput);

    return () => {
      console.log(
        '[Effect] Cleaning up event listeners for machineId:',
        machineId,
      );
      machine.removeEventListener('createAgent', onCreateAgent);
      machine.removeEventListener('output', onOutput);
      machine.removeEventListener('end', onEnd);
      machine.removeEventListener('agentResponse', onAgentResponse);
      machine.removeEventListener('agentWorkingState', onAgentWorkingState);
      machine.removeEventListener('agentState', onAgentState);
      machine.removeEventListener('askForInput', onAskForInput);
      machine.removeEventListener('confirmOutput', onConfirmOutput);
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
    openModal,
    openReviewModal,
  ]);

  useEffect(() => {
    const cleanupReset = reset;
    return () => {
      console.log('[Effect] Component unmounting, resetting state');
      cleanupReset();
    };
  }, [reset]);

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
  }, [getMachine, chatState, setChatState, setFlowError]);

  const startFlow = useCallback(
    (flow: StoredFlow) => {
      reset();
      setLoadedFlow(flow);
      setChatState('waiting-for-parameters');
    },
    [reset, setLoadedFlow, setChatState],
  );

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
