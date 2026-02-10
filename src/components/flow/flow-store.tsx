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
  isParametersNode,
  isSendAgentMessageNode,
} from '../../utils/flow-helpers';
import type { ConditionalNodeProps } from './nodes/conditional';
import type { CreateAgentNodeProps } from './nodes/create-agent';
import type { EndNodeProps } from './nodes/end';
import type { ExtractStringNodeProps } from './nodes/extract-string';
import type { Parameter, ParametersNodeProps } from './nodes/parameters';
import type { SendMessageToAgentProps } from './nodes/send-message-to-agent';

export type AppNodes =
  | ParametersNodeProps
  | CreateAgentNodeProps
  | SendMessageToAgentProps
  | ConditionalNodeProps
  | ExtractStringNodeProps
  | EndNodeProps;

export type AppState = {
  nodes: AppNodes[];
  edges: Edge[];
  onNodesChange: OnNodesChange<AppNodes>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNodes[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateParametersNode: (nodeId: string, parameters: Parameter[]) => void;
  updateCreateAgentNode: (nodeId: string, selectedAgent: string) => void;
  interactive: boolean;
  setInteractive: (interactive: boolean) => void;
  updateSendAgentMessageNode: (
    nodeId: string,
    data: { selectedAgent: string; messageContent: string },
  ) => void;
  updateConditionalNode: (nodeId: string, statement: string) => void;
  updateExtractStringNode: (
    nodeId: string,
    data: { regex: string; from: string },
  ) => void;
  exportToJSON: () => string;
  importFromJSON: (jsonString: string) => void;
};

const initialNodes: AppNodes[] = [];

const initialEdges: Edge[] = [];

export const useFlowStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
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
  updateCreateAgentNode: (nodeId: string, selectedAgent: string) => {
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
    data: { selectedAgent: string; messageContent: string },
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
  exportToJSON: () => {
    const state = get();

    const exportData = {
      nodes: state.nodes,
      edges: state.edges,
    };

    return JSON.stringify(exportData);
  },
  importFromJSON: (jsonString: string) => {
    try {
      const importData = JSON.parse(jsonString);

      if (importData.nodes && importData.edges) {
        set({
          nodes: importData.nodes,
          edges: importData.edges,
        });
      } else {
        throw new Error('Invalid JSON format: missing nodes or edges');
      }
    } catch (error) {
      console.error('Failed to import flow:', error);
      throw error;
    }
  },
}));
