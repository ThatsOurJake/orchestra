import { ReactFlowProvider } from '@xyflow/react';
import { Flow } from '../flow';

export const CreateFlow = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};
