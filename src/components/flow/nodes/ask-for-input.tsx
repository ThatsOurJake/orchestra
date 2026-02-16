import { type Node, type NodeProps, Position } from '@xyflow/react';
import { type ChangeEvent, useCallback, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { determineContextKeysFromNode } from '../../../utils/flow-helpers';
import { BaseHandle } from '../../shadcn/base-handle';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '../../shadcn/base-node';
import { ConnectionHandle } from '../connection-handle';
import { type AppState, useFlowStore } from '../flow-store';
import { useTextInsert } from '../hooks/use-text-insert';

export type AskForInputNodeProps = Node<
  {
    question: string;
  },
  'askForInput'
>;

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  updateAskForInputNode: state.updateAskForInputNode,
});

export const AskForInputNode = ({
  id,
  data: { question = '' },
}: NodeProps<AskForInputNodeProps>) => {
  const questionRef = useRef<HTMLInputElement>(null);
  const { nodes, edges, updateAskForInputNode } = useFlowStore(
    useShallow(selector),
  );

  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );

  const handleQuestionChange = useCallback(
    (newQuestion: string) => {
      updateAskForInputNode(id, { question: newQuestion });
    },
    [id, updateAskForInputNode],
  );

  const {
    onCursorPositionChange: onQuestionCursorChange,
    insertTextAtCursor: insertTextIntoQuestion,
  } = useTextInsert(questionRef, question, handleQuestionChange);

  const onQuestionChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value: newQuestion, selectionStart, selectionEnd },
      } = e;
      updateAskForInputNode(id, { question: newQuestion });

      requestAnimationFrame(() => {
        if (questionRef.current) {
          questionRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    },
    [id, updateAskForInputNode],
  );

  const insertContextValue = useCallback(
    (contextKey: string) => {
      insertTextIntoQuestion(`%${contextKey}%`);
    },
    [insertTextIntoQuestion],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Ask for User Input
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <BaseHandle
          id="ask-for-input-target"
          type="target"
          position={Position.Top}
        />
        <label htmlFor={`${id}-question`} className="text-sm font-medium mb-1">
          Question
        </label>
        <input
          id={`${id}-question`}
          ref={questionRef}
          className="border border-amber-200 p-1 rounded w-full mb-2"
          type="text"
          value={question}
          onChange={onQuestionChange}
          onSelect={onQuestionCursorChange}
          placeholder="Enter question for user..."
        />
        <div>
          <p className="text-sm">
            Context Values - click to insert at cursor position
          </p>
          <div className="flex flex-wrap gap-2">
            {contextProps.map((x) => (
              <p
                className="text-xs text-gray-400 italic cursor-pointer hover:text-amber-600 hover:bg-amber-50 px-1 rounded transition-colors"
                key={`cp-${x[0]}`}
                onClick={() => insertContextValue(x[0])}
                title={`Click to insert %${x[0]}%`}
              >
                {x[0]} - {x[1]}
              </p>
            ))}
          </div>
        </div>
        <ConnectionHandle
          id="ask-for-input-source"
          type="source"
          position={Position.Bottom}
          connectionLimit={1}
        />
      </BaseNodeContent>
      <BaseNodeFooter>
        <p className="text-xs text-gray-400">
          This node will produce "{id}_output"
        </p>
      </BaseNodeFooter>
    </BaseNode>
  );
};
