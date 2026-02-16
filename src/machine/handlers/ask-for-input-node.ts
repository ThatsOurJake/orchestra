import type { AskForInputNodeProps } from '../../components/flow/nodes/ask-for-input';
import { replaceContextInStr } from '../utils';
import type { MachineHandler } from './types';

export const askForInputNodeHandler: MachineHandler<AskForInputNodeProps> = (
  node,
  machine,
) => {
  const { question } = node.data;

  if (!question || question.trim() === '') {
    machine.triggerEnd({
      message: 'Question cannot be empty',
      nodeId: node.id,
    });
    return;
  }

  const processedQuestion = replaceContextInStr(question, machine.context);

  machine.setAwaitingInput();

  machine.triggerEvent('askForInput', {
    nodeId: node.id,
    question: processedQuestion,
  });
};
