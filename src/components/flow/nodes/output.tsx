import { type Node, type NodeProps, Position } from '@xyflow/react';
import { type ChangeEvent, useCallback, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/shadcn/base-node';
import { determineContextKeysFromNode } from '../../../utils/flow-helpers';
import { BaseHandle } from '../../shadcn/base-handle';
import { type AppState, useFlowStore } from '../flow-store';
import { useTextInsert } from '../hooks/use-text-insert';

export type OutputNodeProps = Node<
  {
    messageContent?: string;
  },
  'outputNode'
>;

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setInteractive: state.setInteractive,
  updateOutputNode: state.updateOutputNode,
});

export const OutputNode = ({
  data: { messageContent = '' },
  id,
}: NodeProps<OutputNodeProps>) => {
  const { nodes, edges, setInteractive, updateOutputNode } = useFlowStore(
    useShallow(selector),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );

  const onFocus = useCallback(() => {
    setInteractive(false);
  }, [setInteractive]);

  const onBlur = useCallback(() => {
    setInteractive(true);
  }, [setInteractive]);

  const handleValueChange = useCallback(
    (newValue: string) => {
      updateOutputNode(id, newValue);
    },
    [id, updateOutputNode],
  );

  const { onCursorPositionChange, insertTextAtCursor } = useTextInsert(
    textareaRef,
    messageContent,
    handleValueChange,
  );

  const onMessageChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const {
        target: { value, selectionStart, selectionEnd, scrollTop },
      } = e;

      updateOutputNode(id, value);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
          textareaRef.current.scrollTop = scrollTop;
        }
      });
    },
    [id, updateOutputNode],
  );

  const insertContextValue = useCallback(
    (contextKey: string) => {
      insertTextAtCursor(`%${contextKey}%`);
    },
    [insertTextAtCursor],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Output Message to Main Window</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <BaseHandle id="output-target" type="target" position={Position.Top} />
        <textarea
          ref={textareaRef}
          className="border border-amber-600 w-full h-40 resize-none bg-white p-1 rounded nowheel nodrag"
          onChange={onMessageChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onClick={onCursorPositionChange}
          onKeyUp={onCursorPositionChange}
          value={messageContent}
        />
        <div>
          <p className="text-sm">
            Context Values - click to insert at cursor position
          </p>
          <div className="flex flex-wrap gap-2">
            {contextProps.map((x, index) => (
              <p
                className="text-xs text-gray-400 italic cursor-pointer hover:text-amber-600 hover:bg-amber-50 px-1 rounded transition-colors nodrag"
                key={`cp-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertContextValue(x[0]);
                }}
                title={`Click to insert %${x[0]}%`}
              >
                {x[0]} - {x[1]}
              </p>
            ))}
          </div>
        </div>
        <BaseHandle
          id="output-source"
          type="source"
          position={Position.Bottom}
        />
      </BaseNodeContent>
    </BaseNode>
  );
};
