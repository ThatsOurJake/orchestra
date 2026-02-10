import { type Node, type NodeProps, Position } from '@xyflow/react';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import { determineContextKeysFromNode } from '../../../utils/flow-helpers';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '../../shadcn/base-node';
import { ConnectionHandle } from '../connection-handle';
import { ConnectionLabelHandle } from '../connection-label-handle';
import { type AppState, useFlowStore } from '../flow-store';

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
  const [cursorPosition, setCursorPosition] = useState(0);
  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );

  const onValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value, selectionStart, selectionEnd },
      } = e;
      setCursorPosition(selectionStart || 0);
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

  const onCursorPositionChange = useCallback(
    (e: MouseEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>) => {
      setCursorPosition(e.currentTarget.selectionStart || 0);
    },
    [],
  );

  const insertContextValue = useCallback(
    (contextKey: string) => {
      if (!inputRef.current) return;

      const textToInsert = `%${contextKey}%`;
      const currentValue = statement;
      const newValue =
        currentValue.slice(0, cursorPosition) +
        textToInsert +
        currentValue.slice(cursorPosition);
      const newCursorPos = cursorPosition + textToInsert.length;

      updateConditionalNode(id, newValue);

      // Set cursor position after the inserted text
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      });
    },
    [id, statement, cursorPosition, updateConditionalNode],
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
        <ConnectionHandle
          id="conditional-target"
          type="target"
          position={Position.Top}
          connectionLimit={1}
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
