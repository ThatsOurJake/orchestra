import { create, type StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import baPrompt from '../default-prompts/ba-prompt.txt?raw';
import devPrompt from '../default-prompts/dev-prompt.txt?raw';
import testerPrompt from '../default-prompts/tester-prompt.txt?raw';
import { createIndexedDBStorage } from '../utils/indexeddb-storage';

type ImmerSet = Parameters<
  StateCreator<MainStore, [['zustand/immer', never]], []>
>[0];

// TODO: Stop the default agents from being deleted
export interface Agent {
  name: string;
  id: string;
  prompt: string;
}

export interface StoredFlow {
  name: string;
  id: string;
  flowData: string;
  createdAt: number;
  lastEditedAt?: number;
}

export interface ChatHistoryOutput {
  content: string;
  timestamp: number;
}

export interface ChatHistory {
  id: string;
  flowName: string;
  completedAt: number;
  outputs: ChatHistoryOutput[];
}

export interface MainStore {
  agents: Agent[];
  storedFlows: StoredFlow[];
  chatHistory: ChatHistory[];
  removeAgent: (agentId: string) => void;
  addAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (agent: Agent) => void;
  addFlow: (flow: StoredFlow) => void;
  updateFlow: (flowId: string, flowData: string) => void;
  deleteFlow: (flowId: string) => void;
  addChatHistory: (history: Omit<ChatHistory, 'id' | 'completedAt'>) => void;
  deleteChatHistory: (historyId: string) => void;
}

const defaultAgents: Agent[] = [
  {
    name: 'Business Analyst',
    id: 'default_ba',
    prompt: baPrompt,
  },
  {
    name: 'Junior Developer',
    id: 'default_dev',
    prompt: devPrompt,
  },
  {
    name: 'Junior Tester',
    id: 'default_tester',
    prompt: testerPrompt,
  },
];

const removeAgent = (set: ImmerSet) => (agentId: string) =>
  set((state) => {
    state.agents = state.agents.filter((x) => x.id !== agentId);
  });

const addAgent = (set: ImmerSet) => (agent: Omit<Agent, 'id'>) =>
  set((state) => {
    const wholeAgent: Agent = {
      ...agent,
      id: crypto.randomUUID(),
    };

    state.agents.push(wholeAgent);
  });

const updateAgent = (set: ImmerSet) => (agent: Agent) =>
  set((state) => {
    const idx = state.agents.findIndex((x) => x.id === agent.id);

    if (idx < 0) {
      console.warn('couldnt find agent');
      return;
    }

    state.agents[idx] = agent;
  });

const addFlow = (set: ImmerSet) => (flow: StoredFlow) =>
  set((state) => {
    state.storedFlows.push(flow);
  });

const updateFlow = (set: ImmerSet) => (flowId: string, flowData: string) =>
  set((state) => {
    const existingIndex = state.storedFlows.findIndex((x) => x.id === flowId);

    if (existingIndex >= 0) {
      state.storedFlows[existingIndex].flowData = flowData;
      state.storedFlows[existingIndex].lastEditedAt = Date.now();
    }
  });

const deleteFlow = (set: ImmerSet) => (flowId: string) =>
  set((state) => {
    const filtered = state.storedFlows.filter((x) => x.id !== flowId);
    state.storedFlows = filtered;
  });

const addChatHistory =
  (set: ImmerSet) => (history: Omit<ChatHistory, 'id' | 'completedAt'>) =>
    set((state) => {
      const completeChatHistory: ChatHistory = {
        ...history,
        id: crypto.randomUUID(),
        completedAt: Date.now(),
      };

      state.chatHistory.push(completeChatHistory);
    });

const deleteChatHistory = (set: ImmerSet) => (historyId: string) =>
  set((state) => {
    state.chatHistory = state.chatHistory.filter((x) => x.id !== historyId);
  });

export const useStore = create<MainStore>()(
  devtools(
    persist(
      immer((set) => ({
        agents: [],
        storedFlows: [],
        chatHistory: [],
        removeAgent: removeAgent(set),
        addAgent: addAgent(set),
        updateAgent: updateAgent(set),
        addFlow: addFlow(set),
        updateFlow: updateFlow(set),
        deleteFlow: deleteFlow(set),
        addChatHistory: addChatHistory(set),
        deleteChatHistory: deleteChatHistory(set),
      })),
      {
        name: 'orchestra-store',
        storage: createIndexedDBStorage({
          dbName: 'orchestra-db',
          storeName: 'orchestra-store',
        }),
        partialize: (state) => ({
          agents: state.agents,
          storedFlows: state.storedFlows,
          chatHistory: state.chatHistory,
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<MainStore>;
          return {
            ...currentState,
            ...persisted,
            agents:
              persisted?.agents && persisted.agents.length > 0
                ? persisted.agents
                : defaultAgents,
          };
        },
      },
    ),
  ),
);

export const useAgents = () => useStore().agents;
