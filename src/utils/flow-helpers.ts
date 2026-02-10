import { type Edge, getIncomers } from '@xyflow/react';
import type { AppNodes } from '../components/flow/flow-store';
import type { ConditionalNodeProps } from '../components/flow/nodes/conditional';
import type { CreateAgentNodeProps } from '../components/flow/nodes/create-agent';
import type { ExtractStringNodeProps } from '../components/flow/nodes/extract-string';
import type { ParametersNodeProps } from '../components/flow/nodes/parameters';
import type { SendMessageToAgentProps } from '../components/flow/nodes/send-message-to-agent';

let dndId = 0;
export const getNodeId = (nodeType: AppNodes['type']) =>
  `${nodeType}_${dndId++}`;

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

export const walkBackFindingNodeType = (
  nodeType: AppNodes['type'][],
  startId: string,
  nodesList: AppNodes[] = [],
  edgesList: Edge[] = [],
) => {
  const found: AppNodes[] = [];
  const traversed: AppNodes[] = [];
  const visited = new Set<string>();
  let stopped = false;

  const dfs = (id: string) => {
    if (stopped || visited.has(id)) {
      return;
    }

    visited.add(id);

    const incomers = getIncomers({ id }, nodesList, edgesList) ?? [];
    for (const node of incomers) {
      traversed.push(node);

      if (nodeType.includes(node.type)) {
        found.push(node);
      }

      if (node.type === 'parameters') {
        stopped = true;
        return;
      }

      dfs(node.id);

      if (stopped) {
        return;
      }
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
    ['parameters', 'sendMessageToAgent', 'extractString'],
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

      if (isSendAgentMessageNode(current) || isExtractStringNode(current)) {
        acc.push([`${current.id}_output`, 'string']);
      }

      return acc;
    },
    [],
  );

  // TODO: Something better due to types
  contextProps.push(['prev_node', 'string']);

  return contextProps;
};
