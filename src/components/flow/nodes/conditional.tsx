import { type Node, type NodeProps, Position } from '@xyflow/react';
import { type ChangeEvent, useCallback, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { determineContextKeysFromNode } from '../../../utils/flow-helpers';
import { BaseHandle } from '../../shadcn/base-handle';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '../../shadcn/base-node';
import { ConnectionLabelHandle } from '../connection-label-handle';
import { type AppState, useFlowStore } from '../flow-store';
import { useTextInsert } from '../hooks/use-text-insert';

export type ConditionalNodeProps = Node<
  {
    statement: string;
  },
  'conditional'
>;

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  updateConditionalNode: state.updateConditionalNode,
});

export const ConditionalNode = ({
  id,
  data: { statement = '' },
}: NodeProps<ConditionalNodeProps>) => {
  const { nodes, edges, updateConditionalNode } = useFlowStore(
    useShallow(selector),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      updateConditionalNode(id, newValue);
    },
    [id, updateConditionalNode],
  );

  const { onCursorPositionChange, insertTextAtCursor } = useTextInsert(
    inputRef,
    statement,
    handleValueChange,
  );

  const onValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value, selectionStart, selectionEnd },
      } = e;
      updateConditionalNode(id, value);

      // Restore cursor position after React re-renders
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    },
    [id, updateConditionalNode],
  );

  const insertContextValue = useCallback(
    (contextKey: string) => {
      insertTextAtCursor(`%${contextKey}%`);
    },
    [insertTextAtCursor],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Conditional
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <input
          ref={inputRef}
          type="text"
          className="border border-amber-600 w-full bg-white p-1 rounded text-center nodrag"
          value={statement}
          onChange={onValueChange}
          onClick={onCursorPositionChange}
          onKeyUp={onCursorPositionChange}
        />
        <div>
          <p className="text-sm">
            Context Values - click to insert at cursor position
          </p>
          <div className="flex flex-wrap gap-2">
            {contextProps.map((x, index) => (
              <p
                className="text-xs text-gray-400 italic cursor-pointer hover:text-amber-600 hover:bg-amber-50 px-1 rounded transition-colors"
                key={`cp-${index}`}
                onClick={() => insertContextValue(x[0])}
                title={`Click to insert %${x[0]}%`}
              >
                {x[0]} - {x[1]}
              </p>
            ))}
          </div>
        </div>
        <BaseHandle
          id="conditional-target"
          type="target"
          position={Position.Top}
        />
      </BaseNodeContent>
      <div className="flex justify-between border-t py-2">
        <ConnectionLabelHandle
          id="conditional-true"
          type="source"
          position={Position.Left}
          connectionLimit={2}
          title="True"
        />
        <ConnectionLabelHandle
          id="conditional-false"
          type="source"
          position={Position.Right}
          connectionLimit={2}
          title="False"
        />
      </div>
    </BaseNode>
  );
};
