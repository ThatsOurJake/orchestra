import { ChromeAIAgent } from '../../ai/chromeai-agent';
import type { CreateAgentNodeProps } from '../../components/flow/nodes/create-agent';
import type { MachineHandler } from './types';

export const createAgentNodeHandler: MachineHandler<
  CreateAgentNodeProps
> = async (node, machine) => {
  const { selectedAgent } = node.data as Required<CreateAgentNodeProps['data']>;

  // Set loading state first - the agentState handler will create the agent if needed
  machine.triggerEvent('agentState', {
    agentFlowId: selectedAgent.agentFlowId,
    agentName: selectedAgent.agent.name,
    state: 'loading',
  });

  machine.triggerEvent('createAgent', {
    agentFlowId: selectedAgent.agentFlowId,
    agentName: selectedAgent.agent.name,
  });

  const createdAgent = new ChromeAIAgent(selectedAgent.agent);

  await createdAgent.init();

  machine.triggerEvent('agentState', {
    agentFlowId: selectedAgent.agentFlowId,
    agentName: selectedAgent.agent.name,
    state: 'idle',
  });

  machine.context.set(selectedAgent.agentFlowId, createdAgent);
  machine.context.set(
    `${selectedAgent.agentFlowId}_name`,
    selectedAgent.agent.name,
  );
};
