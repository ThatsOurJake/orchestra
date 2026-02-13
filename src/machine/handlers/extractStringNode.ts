import type { ExtractStringNodeProps } from '../../components/flow/nodes/extract-string';
import { findValueFromNodeInContext } from '../utils';
import type { MachineHandler } from './types';

export const extractStringNodeHandler: MachineHandler<
  ExtractStringNodeProps
> = (node, machine) => {
  const { from, regex } = node.data;

  const strippedRegex =
    regex.startsWith('/') && regex.endsWith('/')
      ? regex.substring(1, regex.length - 1)
      : regex;
  const parsedRegex = new RegExp(strippedRegex, 'i');

  const fromValue = findValueFromNodeInContext(from, machine.context);

  if (fromValue === null) {
    machine.triggerEnd({
      message: `Cannot find ${from} and therefore unable to extract string`,
      nodeId: node.id,
    });

    return;
  }

  if (typeof fromValue !== 'string') {
    machine.triggerEnd({
      message: `Cannot run regex on ${from} as its not a string`,
      nodeId: node.id,
    });

    return;
  }

  const extractedValues = parsedRegex.exec(fromValue);
  const arr = Array.from(extractedValues?.values() || []);
  machine.updateContextWithOutput(node, arr || '');
};
