import type { Edge } from '@xyflow/react';
import { toast } from 'react-toastify';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Machine } from '../../machine';
import type { AppNodes } from '../flow/flow-store';
import type { StoredFlow } from '../store';

// Store the Machine instance outside of Zustand to avoid Immer proxy issues
let machineInstance: Machine | null = null;

export interface StoreAgent {
  agentFlowId: string;
  agentName: string;
  state: 'working' | 'idle' | 'loading';
  outputs: AgentOutput[];
}

export interface AgentOutput {
  response: string;
  timestamp: number;
}

export interface MainOutput {
  content: string;
  timestamp: number;
}

export type ChatStates =
  | 'not-started'
  | 'waiting-for-parameters'
  | 'in-progress'
  | 'ended';

export type ChatWindowStore = {
  getMachine: () => Machine | null;
  machineId: number; // Changes when machine is created to trigger effect re-run
  activeAgents: StoreAgent[];
  activeTab: string;
  chatState: ChatStates;
  loadedFlow: {
    name: string;
    nodes: AppNodes[];
    edges: Edge[];
  } | null;
  mainOutputs: MainOutput[];
  flowError: string | null;

  addAgent: (agentFlowId: string, agentName: string) => void;
  updateAgentWorkingState: (agentFlowId: string, isWorking: boolean) => void;
  updateAgentState: (agentFlowId: string, state: StoreAgent['state']) => void;
  addAgentOutput: (agentFlowId: string, response: string) => void;
  setActiveTab: (tab: string) => void;
  setChatState: (state: ChatStates) => void;
  setLoadedFlow: (flow: StoredFlow) => void;
  createMachine: (inputParameters: Record<string, unknown>) => void;
  addMainOutput: (content: string) => void;
  setFlowError: (error: string | null) => void;
  reset: () => void;
};

const addAgent = (agentFlowId: string, agentName: string) => {
  useChatWindowStore.setState((state) => {
    const existingAgent = state.activeAgents.find(
      (agent) => agent.agentFlowId === agentFlowId,
    );

    if (!existingAgent) {
      state.activeAgents.push({
        agentFlowId,
        agentName,
        state: 'idle',
        outputs: [],
      });
    }
  });
};

const updateAgentWorkingState = (agentFlowId: string, isWorking: boolean) => {
  useChatWindowStore.setState((state) => {
    const agent = state.activeAgents.find((a) => a.agentFlowId === agentFlowId);
    if (agent) {
      agent.state = isWorking ? 'working' : 'idle';
    }
  });
};

const updateAgentState = (
  agentFlowId: string,
  agentState: StoreAgent['state'],
) => {
  useChatWindowStore.setState((state) => {
    const agent = state.activeAgents.find((a) => a.agentFlowId === agentFlowId);
    if (agent) {
      agent.state = agentState;
    }
  });
};

const addAgentOutput = (agentFlowId: string, response: string) => {
  useChatWindowStore.setState((state) => {
    const agent = state.activeAgents.find((a) => a.agentFlowId === agentFlowId);
    if (agent) {
      agent.outputs.push({
        response,
        timestamp: Date.now(),
      });
    }
  });
};

const setActiveTab = (tab: string) => {
  useChatWindowStore.setState((state) => {
    state.activeTab = tab;
  });
};

const setChatState = (chatState: ChatStates) => {
  useChatWindowStore.setState((state) => {
    state.chatState = chatState;
  });
};

const setLoadedFlow = (flow: StoredFlow) => {
  useChatWindowStore.setState((state) => {
    const flowData = JSON.parse(flow.flowData);

    if (!flowData.edges || !flowData.nodes) {
      toast('Cannot start flow - could not find edges and nodes', {
        type: 'error',
      });
      return;
    }

    state.loadedFlow = {
      name: flow.name,
      edges: flowData.edges,
      nodes: flowData.nodes,
    };
  });
};

const createMachine = async (inputParameters: Record<string, unknown>) => {
  const state = useChatWindowStore.getState();

  if (!state.loadedFlow) {
    toast('Cannot create machine - no flow loaded', {
      type: 'error',
    });
    return;
  }

  const { Machine } = await import('../../machine');

  const machine = new Machine(
    state.loadedFlow.nodes,
    state.loadedFlow.edges,
    inputParameters,
  );

  machineInstance = machine;

  // Update machineId to trigger effect re-run
  useChatWindowStore.setState((state) => {
    state.machineId = Date.now();
  });
};

const addMainOutput = (content: string) => {
  useChatWindowStore.setState((state) => {
    state.mainOutputs.push({
      content,
      timestamp: Date.now(),
    });
  });
};

const setFlowError = (error: string | null) => {
  useChatWindowStore.setState((state) => {
    state.flowError = error;
  });
};

const reset = () => {
  machineInstance = null;
  useChatWindowStore.setState((state) => {
    state.machineId = 0;
    state.activeAgents = [];
    state.activeTab = 'default';
    state.chatState = 'not-started';
    state.loadedFlow = null;
    state.mainOutputs = [];
    state.flowError = null;
  });
};

export const useChatWindowStore = create<ChatWindowStore>()(
  immer(() => ({
    getMachine: () => machineInstance,
    machineId: 0,
    activeAgents: [],
    activeTab: 'default',
    chatState: 'not-started',
    loadedFlow: null,
    mainOutputs: [],
    flowError: null,

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
  })),
);
