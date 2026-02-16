import { ChromeAIAgent } from '../../ai/chromeai-agent';
import type { CreateAgentNodeProps } from '../../components/flow/nodes/create-agent';
import type { MachineHandler } from './types';

export const createAgentNodeHandler: MachineHandler<
  CreateAgentNodeProps
> = async (node, machine) => {
  const { selectedAgent } = node.data;

  if (!selectedAgent) {
    machine.triggerEnd({
      nodeId: node.id,
      message: 'Create Agent node is not configured with an agent',
    });
    return;
  }

  const { agent: nodeAgent, agentFlowId } = selectedAgent;

  const currentAgent = machine.agents.find((a) => a.id === nodeAgent.id);

  if (!currentAgent) {
    machine.triggerEnd({
      nodeId: node.id,
      message: `Agent with ID "${nodeAgent.id}" not found. The agent may have been deleted.`,
    });
    return;
  }

  machine.triggerEvent('agentState', {
    agentFlowId,
    agentName: currentAgent.name,
    state: 'loading',
  });

  machine.triggerEvent('createAgent', {
    agentFlowId,
    agentName: currentAgent.name,
  });

  const createdAgent = new ChromeAIAgent(currentAgent);

  await createdAgent.init();

  machine.triggerEvent('agentState', {
    agentFlowId,
    agentName: currentAgent.name,
    state: 'idle',
  });

  machine.context.set(agentFlowId, createdAgent);
  machine.context.set(`${agentFlowId}_name`, currentAgent.name);
};
