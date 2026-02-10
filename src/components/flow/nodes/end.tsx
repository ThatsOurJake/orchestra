import { type Node, type NodeProps, Position } from '@xyflow/react';
import { BaseNode, BaseNodeContent } from '@/components/shadcn/base-node';
import { BaseHandle } from '../../shadcn/base-handle';

export type EndNodeProps = Node<{}, 'endNode'>;

export const EndNode = (_: NodeProps<EndNodeProps>) => {
  return (
    <BaseNode className="w-32">
      <BaseNodeContent>
        <p className="text-center">Ending Node</p>
        <BaseHandle id="end-target" type="target" position={Position.Top} />
      </BaseNodeContent>
    </BaseNode>
  );
};
