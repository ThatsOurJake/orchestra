import type { OutputNodeProps } from '../../components/flow/nodes/output';
import type { Machine } from '..';
import { replaceContextInStr } from '../utils';
import type { MachineHandler } from './types';

export const outputNodeHandler: MachineHandler<OutputNodeProps> = (
  node: OutputNodeProps,
  machine: Machine,
) => {
  const { messageContent, messageLevel } = node.data as Required<
    OutputNodeProps['data']
  >;
  const interpolatedString = replaceContextInStr(
    messageContent,
    machine.context,
  );

  machine.triggerEvent('output', {
    content: interpolatedString,
    level: messageLevel ?? 'info',
  });
};
