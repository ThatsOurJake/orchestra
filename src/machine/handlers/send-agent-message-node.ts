import type { AIAgent } from '../../ai/agent';
import type { SendMessageToAgentProps } from '../../components/flow/nodes/send-message-to-agent';
import type { Machine } from '..';
import { replaceContextInStr } from '../utils';
import type { MachineHandler } from './types';

// TODO: interpolate and syntax run
export const sendAgentMessageNodeHandler: MachineHandler<
  SendMessageToAgentProps
> = async (node: SendMessageToAgentProps, machine: Machine) => {
  const { selectedAgent, messageContent } = node.data as Required<
    SendMessageToAgentProps['data']
  >;

  const foundAgent = machine.context.get(selectedAgent.agentFlowId) as
    | AIAgent
    | undefined;

  if (!foundAgent) {
    machine.triggerEnd({
      nodeId: node.id,
      message: `Could not find agent "${selectedAgent.agent.name} | ${selectedAgent.agentFlowId}"`,
    });

    return;
  }

  const interpolatedString = replaceContextInStr(
    messageContent,
    machine.context,
  );

  const agentName = machine.context.get(
    `${selectedAgent.agentFlowId}_name`,
  ) as string;

  machine.triggerEvent('agentWorkingState', {
    agentFlowId: selectedAgent.agentFlowId,
    agentName: agentName,
    isWorking: true,
  });

  const agentResp = await foundAgent.sendMessage(interpolatedString);

  machine.triggerEvent('agentWorkingState', {
    agentFlowId: selectedAgent.agentFlowId,
    agentName: agentName,
    isWorking: false,
  });

  if (agentResp) {
    machine.triggerEvent('agentResponse', {
      agentFlowId: selectedAgent.agentFlowId,
      agentName: agentName,
      response: agentResp.trim(),
    });

    machine.updateContextWithOutput(node, agentResp);
  } else {
    machine.triggerEnd({
      nodeId: node.id,
      message: 'Agent returned undefined response',
    });
  }
};
