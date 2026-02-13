import { type Edge, getOutgoers } from '@xyflow/react';
import type { AppNodes } from '../components/flow/flow-store';
import type {
  Parameter,
  ParametersNodeProps,
} from '../components/flow/nodes/parameters';
import {
  isConditionalNode,
  isCreateAgentNode,
  isEndNode,
  isExtractStringNode,
  isOutputNode,
  isSendAgentMessageNode,
  isVariableNode,
} from '../utils/flow-helpers';
import { conditionalNodeHandler } from './handlers/conditionalNode';
import { createAgentNodeHandler } from './handlers/createAgentNode';
import { extractStringNodeHandler } from './handlers/extractStringNode';
import { outputNodeHandler } from './handlers/outputNode';
import { sendAgentMessageNodeHandler } from './handlers/sendAgentMessageNode';
import { variableNodeHandler } from './handlers/variableNode';

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

type EventTypes =
  | CreateAgentEvent
  | OutputEvent
  | EndEvent
  | AgentResponseEvent
  | AgentWorkingStateEvent
  | AgentStateEvent;
type EventNames = EventTypes['type'];
type Handler = (event: EventTypes) => void;

interface MachineError {
  nodeId: string;
  message: string;
}

export const PREV_OUTPUT_KEY = 'prev_output';

export class Machine {
  public nodes: AppNodes[];
  public edges: Edge[];

  private startingNode: ParametersNodeProps;
  private prevNode: AppNodes | null = null;
  private hasEnded: boolean = false;
  private manualNextNode: AppNodes | null = null;

  public context: Map<string, unknown> = new Map();

  private eventHandlers: Record<EventNames, Handler[]> = {
    createAgent: [],
    output: [],
    end: [],
    agentResponse: [],
    agentWorkingState: [],
    agentState: [],
  };

  constructor(
    nodes: AppNodes[],
    edges: Edge[],
    inputParameters: Record<string, unknown> = {},
  ) {
    this.nodes = nodes;
    this.edges = edges;

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
    console.log(
      `%cContext: %c${node.id}_output | ${value}`,
      'color: red',
      'color: white',
    );
    this.context.set(`${node.id}_output`, value);
    this.context.set(PREV_OUTPUT_KEY, value);
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

  public triggerEnd(err?: MachineError) {
    this.hasEnded = true;
    this.triggerEvent('end', {
      err,
    });
  }

  public async start() {
    console.log('Starting Machine');
    while (!this.hasEnded) {
      await this.advance();
    }
    console.log('Done');
  }
}
