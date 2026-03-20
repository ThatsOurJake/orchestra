import type { AppNodes } from '../flow-store';

export interface NodeGroup {
  id: string;
  label: string;
  headerColor: string;
  nodes: { nodeType: AppNodes['type']; label: string; colorClass: string }[];
}

export const NODE_GROUPS: NodeGroup[] = [
  {
    id: 'flow',
    label: 'Flow Control',
    headerColor: 'bg-green-100 text-green-900',
    nodes: [
      {
        nodeType: 'parameters',
        label: 'Starting Node',
        colorClass: 'bg-green-50',
      },
      {
        nodeType: 'conditional',
        label: 'Conditional',
        colorClass: 'bg-green-50',
      },
      { nodeType: 'endNode', label: 'Ending Node', colorClass: 'bg-green-50' },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    headerColor: 'bg-blue-100 text-blue-900',
    nodes: [
      {
        nodeType: 'createAgent',
        label: 'Create Agent',
        colorClass: 'bg-blue-50',
      },
      {
        nodeType: 'sendMessageToAgent',
        label: 'Send Message to Agent',
        colorClass: 'bg-blue-50',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    headerColor: 'bg-amber-100 text-amber-900',
    nodes: [
      { nodeType: 'variable', label: 'Variable', colorClass: 'bg-amber-50' },
      {
        nodeType: 'extractString',
        label: 'Extract String',
        colorClass: 'bg-amber-50',
      },
    ],
  },
  {
    id: 'interaction',
    label: 'User Interaction',
    headerColor: 'bg-rose-100 text-rose-900',
    nodes: [
      {
        nodeType: 'askForInput',
        label: 'Ask for User Input',
        colorClass: 'bg-rose-50',
      },
      {
        nodeType: 'confirmOutput',
        label: 'Review Content',
        colorClass: 'bg-rose-50',
      },
      {
        nodeType: 'outputNode',
        label: 'Output to Main',
        colorClass: 'bg-rose-50',
      },
    ],
  },
];
