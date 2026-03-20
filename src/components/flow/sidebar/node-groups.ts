import type { AppNodes } from '../flow-store';

export interface NodeGroup {
  id: string;
  label: string;
  headerColour: string;
  nodeColourClass: string;
  nodes: { nodeType: AppNodes['type']; label: string }[];
}

export const NODE_GROUPS: NodeGroup[] = [
  {
    id: 'flow',
    label: 'Flow Control',
    headerColour: 'bg-green-100 text-green-900',
    nodeColourClass: 'bg-green-50',
    nodes: [
      { nodeType: 'parameters', label: 'Starting Node' },
      { nodeType: 'conditional', label: 'Conditional' },
      { nodeType: 'endNode', label: 'Ending Node' },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    headerColour: 'bg-blue-100 text-blue-900',
    nodeColourClass: 'bg-blue-50',
    nodes: [
      { nodeType: 'createAgent', label: 'Create Agent' },
      { nodeType: 'sendMessageToAgent', label: 'Send Message to Agent' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    headerColour: 'bg-amber-100 text-amber-900',
    nodeColourClass: 'bg-amber-50',
    nodes: [
      { nodeType: 'variable', label: 'Variable' },
      { nodeType: 'extractString', label: 'Extract String' },
    ],
  },
  {
    id: 'interaction',
    label: 'User Interaction',
    headerColour: 'bg-rose-100 text-rose-900',
    nodeColourClass: 'bg-rose-50',
    nodes: [
      { nodeType: 'askForInput', label: 'Ask for User Input' },
      { nodeType: 'confirmOutput', label: 'Review Content' },
      { nodeType: 'outputNode', label: 'Output to Main' },
    ],
  },
];
