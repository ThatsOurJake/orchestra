import { type Handle, useNodeConnections } from '@xyflow/react';
import type { ComponentProps } from 'react';
import { BaseHandle } from '../shadcn/base-handle';

interface ConnectionHandleProps extends ComponentProps<typeof Handle> {
  connectionLimit: number;
}

export const ConnectionHandle = ({
  connectionLimit,
  ...props
}: ConnectionHandleProps) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <BaseHandle
      {...props}
      isConnectable={connections.length < connectionLimit}
    />
  );
};
