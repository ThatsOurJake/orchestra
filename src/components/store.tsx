import { create, type StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import baPrompt from '../default-prompts/ba-prompt.txt?raw';
import devPrompt from '../default-prompts/dev-prompt.txt?raw';
import testerPrompt from '../default-prompts/tester-prompt.txt?raw';
import { createIndexedDBStorage } from '../utils/indexeddb-storage';

type ImmerSet = Parameters<
  StateCreator<Store, [['zustand/immer', never]], []>
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
}

interface Store {
  agents: Agent[];
  storedFlows: StoredFlow[];
  removeAgent: (agentId: string) => void;
  addAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (agent: Agent) => void;
  addFlow: (flow: StoredFlow) => void;
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

export const useStore = create<Store>()(
  devtools(
    persist(
      immer((set) => ({
        agents: defaultAgents,
        storedFlows: [],
        removeAgent: removeAgent(set),
        addAgent: addAgent(set),
        updateAgent: updateAgent(set),
        addFlow: addFlow(set),
      })),
      {
        name: 'orchestra-store',
        storage: createIndexedDBStorage({
          dbName: 'orchestra-db',
          storeName: 'orchestra-store',
        }),
      },
    ),
  ),
);

export const useAgents = () => useStore().agents;
