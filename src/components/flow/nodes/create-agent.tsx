import { type Node, type NodeProps, Position } from '@xyflow/react';
import { type ChangeEvent, useCallback } from 'react';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '../../shadcn/base-node';
import { type Agent, useAgents } from '../../store';
import { ConnectionHandle } from '../connection-handle';
import { useFlowStore } from '../flow-store';

export type CreateAgentNodeProps = Node<
  {
    selectedAgent?: {
      agent: Agent;
      agentFlowId: string;
    };
  },
  'createAgent'
>;

export const CreateAgentNode = ({
  data: { selectedAgent },
  id,
}: NodeProps<CreateAgentNodeProps>) => {
  const agents = useAgents();
  const updateCreateAgentNode = useFlowStore(
    (state) => state.updateCreateAgentNode,
  );

  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const {
        target: { value },
      } = e;
      const agent = agents.find((x) => x.id === value)!;

      updateCreateAgentNode(id, {
        agent,
        agentFlowId: crypto.randomUUID(),
      });
    },
    [updateCreateAgentNode, id, agents],
  );

  return (
    <BaseNode className="w-72">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Agent Creation
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <ConnectionHandle
          id="create-agent-target"
          type="target"
          position={Position.Top}
          connectionLimit={1}
        />
        <select
          className="border border-amber-200 p-0.5 rounded"
          value={selectedAgent?.agent.id || 'default'}
          onChange={onChange}
        >
          <option disabled value="default">
            Select an agent
          </option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <ConnectionHandle
          id="create-agent-source"
          type="source"
          position={Position.Bottom}
          connectionLimit={1}
        />
      </BaseNodeContent>
    </BaseNode>
  );
};
