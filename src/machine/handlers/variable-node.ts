import type { VariableNodeProps } from '../../components/flow/nodes/variable';
import { langRunner } from '../../lang/runner';
import type { MachineHandler } from './types';

export const variableNodeHandler: MachineHandler<VariableNodeProps> = (
  node,
  machine,
) => {
  const { name, value } = node.data;
  const result = langRunner(value, machine.context);
  machine.context.set(name, result);
};
