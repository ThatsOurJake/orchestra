import { getConnectedEdges } from '@xyflow/react';
import type { ConditionalNodeProps } from '../../components/flow/nodes/conditional';
import { langRunner } from '../../lang/runner';
import type { MachineHandler } from './types';

export const conditionalNodeHandler: MachineHandler<
  ConditionalNodeProps
> = async (node, machine) => {
  const { statement } = node.data;
  const result = langRunner(statement, machine.context);
  const connectedEdges = getConnectedEdges([node], machine.edges).filter(
    (x) => x.target !== node.id,
  );

  if (typeof result !== 'boolean') {
    machine.triggerEnd({
      message: `"${statement}" did not return a boolean.`,
      nodeId: node.id,
    });
    return;
  }

  const conditionalEdge = connectedEdges.find((x) =>
    x.sourceHandle?.includes(`${result}`),
  );

  if (!conditionalEdge) {
    machine.triggerEnd({
      message: 'Could not find a valid connection',
      nodeId: node.id,
    });
    return;
  }

  const targetNode = machine.nodes.find((n) => n.id === conditionalEdge.target);

  if (!targetNode) {
    machine.triggerEnd({
      message: `Could not find target node: ${conditionalEdge.target}`,
      nodeId: node.id,
    });
    return;
  }

  machine.setNextNode(targetNode);
};
