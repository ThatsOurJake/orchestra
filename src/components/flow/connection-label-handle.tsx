import { useNodeConnections } from '@xyflow/react';
import type { ComponentProps } from 'react';
import { LabeledHandle } from '../shadcn/labeled-handle';

interface ConnectionLabelHandleProps
  extends ComponentProps<typeof LabeledHandle> {
  connectionLimit: number;
}

export const ConnectionLabelHandle = ({
  connectionLimit,
  ...props
}: ConnectionLabelHandleProps) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <LabeledHandle
      {...props}
      isConnectable={connections.length < connectionLimit}
    />
  );
};
