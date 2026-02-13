import type { AppNodes } from '../../components/flow/flow-store';
import type { Machine } from '..';

export type MachineHandler<N extends AppNodes> = (
  node: N,
  machine: Machine,
) => void | Promise<void>;
