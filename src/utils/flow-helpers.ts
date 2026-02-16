import { type Edge, getIncomers } from '@xyflow/react';
import type { AppNodes } from '../components/flow/flow-store';
import type { AskForInputNodeProps } from '../components/flow/nodes/ask-for-input';
import type { ConditionalNodeProps } from '../components/flow/nodes/conditional';
import type { CreateAgentNodeProps } from '../components/flow/nodes/create-agent';
import type { ExtractStringNodeProps } from '../components/flow/nodes/extract-string';
import type { OutputNodeProps } from '../components/flow/nodes/output';
import type { ParametersNodeProps } from '../components/flow/nodes/parameters';
import type { SendMessageToAgentProps } from '../components/flow/nodes/send-message-to-agent';
import type { VariableNodeProps } from '../components/flow/nodes/variable';

const nodeIdHelperBuilder = () => {
  let currentId = 0;

  const getNodeId = (nodeType: AppNodes['type']) =>
    `${nodeType}_${currentId++}`;

  const resetId = () => {
    currentId = 0;
  };

  return {
    getNodeId,
    resetId,
  };
};

export const nodeIdHelper = nodeIdHelperBuilder();

export const isParametersNode = (node: AppNodes): node is ParametersNodeProps =>
  node.type === 'parameters';

export const isCreateAgentNode = (
  node: AppNodes,
): node is CreateAgentNodeProps => node.type === 'createAgent';

export const isSendAgentMessageNode = (
  node: AppNodes,
): node is SendMessageToAgentProps => node.type === 'sendMessageToAgent';

export const isConditionalNode = (
  node: AppNodes,
): node is ConditionalNodeProps => node.type === 'conditional';

export const isExtractStringNode = (
  node: AppNodes,
): node is ExtractStringNodeProps => node.type === 'extractString';

export const isVariableNode = (node: AppNodes): node is VariableNodeProps =>
  node.type === 'variable';

export const isOutputNode = (node: AppNodes): node is OutputNodeProps =>
  node.type === 'outputNode';

export const isEndNode = (node: AppNodes): node is OutputNodeProps =>
  node.type === 'endNode';

export const isAskForInputNode = (
  node: AppNodes,
): node is AskForInputNodeProps => node.type === 'askForInput';

export const walkBackFindingNodeType = (
  nodeType: AppNodes['type'][],
  startId: string,
  nodesList: AppNodes[] = [],
  edgesList: Edge[] = [],
) => {
  const found: AppNodes[] = [];
  const traversed: AppNodes[] = [];
  const visited = new Set<string>();

  const dfs = (id: string) => {
    if (visited.has(id)) {
      return;
    }

    visited.add(id);

    const incomers = getIncomers({ id }, nodesList, edgesList) ?? [];
    for (const node of incomers) {
      traversed.push(node);

      if (nodeType.includes(node.type)) {
        found.push(node);
      }

      dfs(node.id);
    }
  };

  dfs(startId);

  return { found, traversed };
};

export const determineContextKeysFromNode = (
  startId: string,
  nodesList: AppNodes[] = [],
  edgesList: Edge[] = [],
) => {
  const { found: dataSettingNodes } = walkBackFindingNodeType(
    [
      'parameters',
      'sendMessageToAgent',
      'extractString',
      'variable',
      'askForInput',
    ],
    startId,
    nodesList,
    edgesList,
  );

  const contextProps: string[][] = dataSettingNodes.reduce(
    (acc: string[][], current: AppNodes) => {
      if (isParametersNode(current)) {
        const flat = current.data.params?.map((x) => [x.name, x.type]);
        if (flat) {
          acc.push(...flat);
        }
      }

      if (
        isSendAgentMessageNode(current) ||
        isExtractStringNode(current) ||
        isAskForInputNode(current)
      ) {
        acc.push([`${current.id}_output`, 'string']);
      }

      if (isVariableNode(current)) {
        const {
          data: { name, type },
        } = current;
        acc.push([name, type]);
      }

      return acc;
    },
    [],
  );

  // TODO: Something better due to types
  contextProps.push(['prev_output', 'string']);

  const uniqueContextProps = contextProps.filter(
    (item, index, self) => index === self.findIndex((t) => t[0] === item[0]),
  );

  return uniqueContextProps;
};
