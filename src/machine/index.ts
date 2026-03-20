import { type Edge, getOutgoers } from '@xyflow/react';
import type { AppNodes } from '../components/flow/flow-store';
import type {
  Parameter,
  ParametersNodeProps,
} from '../components/flow/nodes/parameters';
import type { Agent } from '../components/store';
import {
  isAskForInputNode,
  isConditionalNode,
  isConfirmOutputNode,
  isCreateAgentNode,
  isEndNode,
  isExtractStringNode,
  isOutputNode,
  isSendAgentMessageNode,
  isVariableNode,
} from '../utils/flow-helpers';
import { askForInputNodeHandler } from './handlers/ask-for-input-node';
import { conditionalNodeHandler } from './handlers/conditional-node';
import { confirmOutputNodeHandler } from './handlers/confirm-output-node';
import { createAgentNodeHandler } from './handlers/create-agent-node';
import { extractStringNodeHandler } from './handlers/extract-string-node';
import { outputNodeHandler } from './handlers/output-node';
import { sendAgentMessageNodeHandler } from './handlers/send-agent-message-node';
import { variableNodeHandler } from './handlers/variable-node';

interface BaseEvent<T extends string> {
  type: T;
}

export interface CreateAgentEvent extends BaseEvent<'createAgent'> {
  data: {
    agentFlowId: string;
    agentName: string;
  };
}

export interface OutputEvent extends BaseEvent<'output'> {
  data: {
    content: string;
    level?: 'info' | 'warning' | 'error';
  };
}

export interface EndEvent extends BaseEvent<'end'> {
  data: {
    err?: MachineError;
  };
}

export interface AgentResponseEvent extends BaseEvent<'agentResponse'> {
  data: {
    agentFlowId: string;
    agentName: string;
    response: string;
  };
}

export interface AgentWorkingStateEvent extends BaseEvent<'agentWorkingState'> {
  data: {
    agentFlowId: string;
    agentName: string;
    isWorking: boolean;
  };
}

export interface AgentStateEvent extends BaseEvent<'agentState'> {
  data: {
    agentFlowId: string;
    agentName: string;
    state: 'working' | 'idle' | 'loading';
  };
}

export interface AskForInputEvent extends BaseEvent<'askForInput'> {
  data: {
    nodeId: string;
    question: string;
  };
}

export interface ConfirmOutputEvent extends BaseEvent<'confirmOutput'> {
  data: {
    nodeId: string;
    label: string;
    content: string;
  };
}

type EventTypes =
  | CreateAgentEvent
  | OutputEvent
  | EndEvent
  | AgentResponseEvent
  | AgentWorkingStateEvent
  | AgentStateEvent
  | AskForInputEvent
  | ConfirmOutputEvent;
type EventNames = EventTypes['type'];
type Handler = (event: EventTypes) => void;

interface MachineError {
  nodeId: string;
  message: string;
}

export const PREV_OUTPUT_KEY = 'prev_output';

type MachineState = 'running' | 'awaiting-input' | 'ended';

export class Machine {
  public nodes: AppNodes[];
  public edges: Edge[];
  public agents: Agent[];

  private startingNode: ParametersNodeProps;
  private prevNode: AppNodes | null = null;
  public hasEnded: boolean = false;
  private manualNextNode: AppNodes | null = null;
  private state: MachineState = 'running';

  public context: Map<string, unknown> = new Map();

  private eventHandlers: Record<EventNames, Handler[]> = {
    createAgent: [],
    output: [],
    end: [],
    agentResponse: [],
    agentWorkingState: [],
    agentState: [],
    askForInput: [],
    confirmOutput: [],
  };

  constructor(
    nodes: AppNodes[],
    edges: Edge[],
    inputParameters: Record<string, unknown> = {},
    agents: Agent[] = [],
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.agents = agents;

    const startingNode = this.nodes.find((x) => x.type === 'parameters');

    if (!startingNode) {
      throw new Error('No parameters node found in flow');
    }

    this.startingNode = startingNode;

    this.validateParameters(this.startingNode.data.params, inputParameters);

    for (const element of Object.entries(inputParameters)) {
      const [key, val] = element;
      this.context.set(key, val);
    }
  }

  validateParameters = (
    startingNodeParameters: Parameter[],
    inputParameters: Record<string, unknown>,
  ) => {
    if (!startingNodeParameters) {
      return;
    }

    if (
      Object.keys(startingNodeParameters).length !==
      Object.keys(inputParameters).length
    ) {
      this.triggerEnd({
        message: 'Not all input parameters are present',
        nodeId: 'startingNode',
      });

      return;
    }

    const startNodeParamKeys = startingNodeParameters.map((x) => x.name);
    const inputParamKeys = Object.keys(inputParameters);

    if (!startNodeParamKeys.every((key) => inputParamKeys.includes(key))) {
      this.triggerEnd({
        message: 'Not all required parameters are present in input',
        nodeId: 'startingNode',
      });

      return;
    }
  };

  public addEventListener<T extends EventNames>(
    eventType: T,
    handler: (event: Extract<EventTypes, { type: T }>) => void,
  ) {
    this.eventHandlers[eventType].push(handler as Handler);
  }

  public removeEventListener<T extends EventNames>(
    eventType: T,
    handler: (event: Extract<EventTypes, { type: T }>) => void,
  ) {
    const copy = this.eventHandlers[eventType].slice();
    this.eventHandlers[eventType] = copy.filter(
      (x) => x !== (handler as Handler),
    );
  }

  public triggerEvent<T extends EventNames>(
    eventType: T,
    data: Extract<EventTypes, { type: T }>['data'],
  ) {
    for (const handler of this.eventHandlers[eventType]) {
      handler({
        type: eventType,
        data,
      } as EventTypes);
    }
  }

  public updateContextWithOutput(node: AppNodes, value: unknown) {
    this.context.set(`${node.id}_output`, value);
    this.context.set(PREV_OUTPUT_KEY, value);
  }

  private async processUntilInputOrEnd() {
    while (!this.hasEnded && this.state !== 'awaiting-input') {
      await this.advance();
    }
  }

  public async provideInput(nodeId: string, input: string) {
    if (this.hasEnded) {
      console.warn('Cannot provide input - flow has ended');
      return;
    }

    if (this.state !== 'awaiting-input') {
      console.warn('Machine is not awaiting input');
      return;
    }

    const node = this.nodes.find((n) => n.id === nodeId);

    if (!node) {
      console.error(`Node ${nodeId} not found`);
      return;
    }

    if (!isAskForInputNode(node)) {
      console.error(`Node ${nodeId} is not an askForInput node`);
      return;
    }

    this.updateContextWithOutput(node, input);

    this.triggerEvent('output', {
      content: `User responded: ${input}`,
    });

    this.state = 'running';
    await this.processUntilInputOrEnd();
  }

  public async provideConfirmation(nodeId: string, approved: boolean) {
    if (this.hasEnded) {
      console.warn('Cannot provide confirmation - flow has ended');
      return;
    }

    if (this.state !== 'awaiting-input') {
      console.warn('Machine is not awaiting input');
      return;
    }

    const node = this.nodes.find((n) => n.id === nodeId);

    if (!node) {
      console.error(`Node ${nodeId} not found`);
      return;
    }

    if (!isConfirmOutputNode(node)) {
      console.error(`Node ${nodeId} is not a confirmOutput node`);
      return;
    }

    const { getConnectedEdges } = await import('@xyflow/react');
    const connectedEdges = getConnectedEdges([node], this.edges).filter(
      (e) => e.source === node.id,
    );

    const handleId = approved
      ? 'confirm-output-approved'
      : 'confirm-output-rejected';
    const targetEdge = connectedEdges.find((e) => e.sourceHandle === handleId);

    if (!targetEdge) {
      this.triggerEnd({
        message: `Review Content node: no connection found for "${approved ? 'approved' : 'rejected'}" path`,
        nodeId: node.id,
      });
      return;
    }

    const targetNode = this.nodes.find((n) => n.id === targetEdge.target);

    if (!targetNode) {
      this.triggerEnd({
        message: `Review Content node: target node not found`,
        nodeId: node.id,
      });
      return;
    }

    this.setNextNode(targetNode);
    this.state = 'running';
    await this.processUntilInputOrEnd();
  }

  private async handleNode(node: AppNodes) {
    if (isCreateAgentNode(node)) {
      await createAgentNodeHandler(node, this);
      return;
    }

    if (isSendAgentMessageNode(node)) {
      await sendAgentMessageNodeHandler(node, this);
      return;
    }

    if (isExtractStringNode(node)) {
      extractStringNodeHandler(node, this);
      return;
    }

    if (isConditionalNode(node)) {
      conditionalNodeHandler(node, this);
      return;
    }

    if (isVariableNode(node)) {
      variableNodeHandler(node, this);
      return;
    }

    if (isOutputNode(node)) {
      outputNodeHandler(node, this);
      return;
    }

    if (isAskForInputNode(node)) {
      askForInputNodeHandler(node, this);
      return;
    }

    if (isConfirmOutputNode(node)) {
      confirmOutputNodeHandler(node, this);
      return;
    }

    if (isEndNode(node)) {
      this.triggerEnd();
      return;
    }
  }

  public async advance() {
    if (this.hasEnded) {
      return;
    }

    let nextNode: AppNodes;

    if (this.manualNextNode) {
      nextNode = this.manualNextNode;
      this.manualNextNode = null;
    } else {
      const connected = getOutgoers(
        this.prevNode || this.startingNode,
        this.nodes,
        this.edges,
      );

      if (connected.length > 1) {
        console.warn(`Multiple connected to starting node`, connected);
      }

      nextNode = connected[0];
    }

    this.prevNode = nextNode;

    try {
      console.log(`Handling node: ${nextNode.id}`);
      await this.handleNode(nextNode);
    } catch (err) {
      const error = err as Error;
      this.triggerEnd({
        nodeId: nextNode.id,
        message: error.message,
      });
    }
  }

  public setNextNode(nextNode: AppNodes) {
    this.manualNextNode = nextNode;
  }

  public setAwaitingInput() {
    this.state = 'awaiting-input';
  }

  public triggerEnd(err?: MachineError) {
    this.hasEnded = true;
    this.state = 'ended';
    this.triggerEvent('end', {
      err,
    });
  }

  public async start() {
    console.log('Starting Machine');

    if (this.context.size > 0) {
      const contextStr = Array.from(this.context.entries())
        .map((entry) => {
          const [key, val] = entry;
          return `- ${key} : ${val}`;
        })
        .join('\n');
      this.triggerEvent('output', {
        content: `Started flow with following parameters:\n${contextStr}`,
      });
    } else {
      this.triggerEvent('output', {
        content: `Started flow!`,
      });
    }

    await this.processUntilInputOrEnd();
    console.log('Done');
  }
}
