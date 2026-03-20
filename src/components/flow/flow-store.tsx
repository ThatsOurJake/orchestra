import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import { create } from 'zustand';
import {
  isConditionalNode,
  isCreateAgentNode,
  isExtractStringNode,
  isOutputNode,
  isParametersNode,
  isSendAgentMessageNode,
  isVariableNode,
} from '../../utils/flow-helpers';
import type { Agent, StoredFlow } from '../store';
import type { AskForInputNodeProps } from './nodes/ask-for-input';
import type { ConditionalNodeProps } from './nodes/conditional';
import type { CreateAgentNodeProps } from './nodes/create-agent';
import type { EndNodeProps } from './nodes/end';
import type { ExtractStringNodeProps } from './nodes/extract-string';
import type { OutputMessageLevel, OutputNodeProps } from './nodes/output';
import type { Parameter, ParametersNodeProps } from './nodes/parameters';
import type { SendMessageToAgentProps } from './nodes/send-message-to-agent';
import type { VariableNodeProps } from './nodes/variable';

export type AppNodes =
  | ParametersNodeProps
  | CreateAgentNodeProps
  | SendMessageToAgentProps
  | ConditionalNodeProps
  | ExtractStringNodeProps
  | EndNodeProps
  | VariableNodeProps
  | OutputNodeProps
  | AskForInputNodeProps;

export type AppState = {
  nodes: AppNodes[];
  edges: Edge[];
  onNodesChange: OnNodesChange<AppNodes>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNodes[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateParametersNode: (nodeId: string, parameters: Parameter[]) => void;
  updateCreateAgentNode: (
    nodeId: string,
    selectedAgent: { agent: Agent; agentFlowId: string },
  ) => void;
  interactive: boolean;
  setInteractive: (interactive: boolean) => void;
  updateSendAgentMessageNode: (
    nodeId: string,
    data: {
      selectedAgent: { agent: Agent; agentFlowId: string };
      messageContent: string;
    },
  ) => void;
  updateConditionalNode: (nodeId: string, statement: string) => void;
  updateExtractStringNode: (
    nodeId: string,
    data: { regex: string; from: string },
  ) => void;
  updateVariableNode: (
    nodeId: string,
    data: { name: string; value: string },
  ) => void;
  updateOutputNode: (nodeId: string, messageContent: string) => void;
  updateAskForInputNode: (nodeId: string, data: { question: string }) => void;
  projectSettings: {
    savedSinceEdits: boolean;
    loadedId?: string;
    loadedName?: string;
  };
  exportFlowData: () => {
    flow: string;
    projectSettings: { id?: string; name?: string };
  };
  importFlowData: (flow: StoredFlow) => void;
  setProjectSavedValue: (savedValue: boolean) => void;
  setProjectSettings: (id: string, name: string) => void;
  resetProjectSettings: () => void;
};

const initialNodes: AppNodes[] = [];

const initialEdges: Edge[] = [];

export const useFlowStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes) => {
    const state = get();

    set({
      nodes: applyNodeChanges(changes, get().nodes),
      projectSettings: {
        ...state.projectSettings,
        savedSinceEdits: false,
      },
    });
  },
  onEdgesChange: (changes) => {
    const state = get();

    set({
      edges: applyEdgeChanges(changes, get().edges),
      projectSettings: {
        ...state.projectSettings,
        savedSinceEdits: false,
      },
    });
  },
  onConnect: (connection) => {
    const state = get();

    set({
      edges: addEdge(
        {
          ...connection,
          type: 'step',
        },
        get().edges,
      ),
      projectSettings: {
        ...state.projectSettings,
        savedSinceEdits: false,
      },
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  updateParametersNode: (nodeId: string, parameters: Parameter[]) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && isParametersNode(node)) {
          return { ...node, data: { ...node.data, params: parameters } };
        }

        return node;
      }),
    });
  },
  updateCreateAgentNode: (
    nodeId: string,
    selectedAgent: { agent: Agent; agentFlowId: string },
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && isCreateAgentNode(node)) {
          return { ...node, data: { ...node.data, selectedAgent } };
        }

        return node;
      }),
    });
  },
  interactive: true,
  setInteractive: (interactive) => {
    set({
      interactive,
    });
  },
  updateSendAgentMessageNode: (
    nodeId: string,
    data: {
      selectedAgent: { agent: Agent; agentFlowId: string };
      messageContent: string;
    },
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && isSendAgentMessageNode(node)) {
          return {
            ...node,
            data: {
              ...node.data,
              selectedAgent: data.selectedAgent,
              messageContent: data.messageContent,
            },
          };
        }

        return node;
      }),
    });
  },
  updateConditionalNode: (nodeId: string, statement: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && isConditionalNode(node)) {
          return { ...node, data: { ...node.data, statement } };
        }

        return node;
      }),
    });
  },
  updateExtractStringNode: (
    nodeId: string,
    data: { regex: string; from: string },
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && isExtractStringNode(node)) {
          return {
            ...node,
            data: { ...node.data, regex: data.regex, from: data.from },
          };
        }

        return node;
      }),
    });
  },
  updateVariableNode: (
    nodeId: string,
    data: { name: string; value: string },
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && isVariableNode(node)) {
          return {
            ...node,
            data: {
              ...node.data,
              name: data.name,
              value: data.value,
              type: 'string',
            },
          };
        }

        return node;
      }),
    });
  },
  updateOutputNode: (
    nodeId: string,
    data: {
      messageContent?: string;
      messageLevel?: OutputMessageLevel;
    },
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && isOutputNode(node)) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }

        return node;
      }),
    });
  },
  updateAskForInputNode: (nodeId: string, data: { question: string }) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && node.type === 'askForInput') {
          return {
            ...node,
            data: { ...node.data, question: data.question },
          };
        }

        return node;
      }),
    });
  },
  exportFlowData: () => {
    const state = get();

    const exportData = {
      nodes: state.nodes,
      edges: state.edges,
    };

    // TODO: Fix to allow saving and override saving if same project
    return {
      flow: JSON.stringify(exportData),
      projectSettings: {
        id: state.projectSettings.loadedId,
        name: state.projectSettings.loadedName,
      },
    };
  },
  importFlowData: (flow: StoredFlow) => {
    const state = get();

    try {
      const { flowData, id, name } = flow;
      const importData = JSON.parse(flowData);

      if (importData.nodes && importData.edges) {
        set({
          nodes: importData.nodes,
          edges: importData.edges,
          projectSettings: {
            ...state.projectSettings,
            savedSinceEdits: true,
            loadedId: id,
            loadedName: name,
          },
        });
      } else {
        throw new Error('Invalid JSON format: missing nodes or edges');
      }
    } catch (error) {
      console.error('Failed to import flow:', error);
      throw error;
    }
  },
  projectSettings: {
    savedSinceEdits: false,
  },
  setProjectSavedValue: (savedValue: boolean) => {
    const state = get();
    set({
      projectSettings: {
        ...state.projectSettings,
        savedSinceEdits: savedValue,
      },
    });
  },
  setProjectSettings: (id: string, name: string) => {
    const state = get();
    set({
      projectSettings: {
        ...state.projectSettings,
        loadedId: id,
        loadedName: name,
        savedSinceEdits: true,
      },
    });
  },
  resetProjectSettings: () => {
    set({
      projectSettings: {
        savedSinceEdits: false,
      },
    });
  },
}));
