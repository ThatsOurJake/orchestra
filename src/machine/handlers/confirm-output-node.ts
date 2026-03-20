import type { ConfirmOutputNodeProps } from '../../components/flow/nodes/confirm-output';
import { replaceContextInStr } from '../utils';
import type { MachineHandler } from './types';

export const confirmOutputNodeHandler: MachineHandler<
  ConfirmOutputNodeProps
> = (node, machine) => {
  const { label = '', contentKey = '' } = node.data;

  if (!contentKey) {
    machine.triggerEnd({
      message: 'Review Content node has no content key selected',
      nodeId: node.id,
    });
    return;
  }

  const rawContent = machine.context.get(contentKey);

  if (rawContent === undefined) {
    machine.triggerEnd({
      message: `Review Content node: context key "${contentKey}" not found`,
      nodeId: node.id,
    });
    return;
  }

  const resolvedLabel = replaceContextInStr(label, machine.context);
  const content = String(rawContent);

  machine.setAwaitingInput();

  machine.triggerEvent('confirmOutput', {
    nodeId: node.id,
    label: resolvedLabel,
    content,
  });
};
