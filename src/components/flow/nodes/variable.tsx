import { type Node, type NodeProps, Position } from '@xyflow/react';
import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/shallow';
import { determineContextKeysFromNode } from '../../../utils/flow-helpers';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '../../shadcn/base-node';
import { ConnectionHandle } from '../connection-handle';
import { type AppState, useFlowStore } from '../flow-store';
import { useTextInsert } from '../hooks/use-text-insert';

export type VariableNodeProps = Node<
  {
    name: string;
    value: string;
    type: string;
  },
  'variable'
>;

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  updateVariableNode: state.updateVariableNode,
});

export const VariableNode = ({
  id,
  data: { name = '', value = '' },
}: NodeProps<VariableNodeProps>) => {
  const varNameRef = useRef<HTMLInputElement>(null);
  const varValueRef = useRef<HTMLInputElement>(null);
  const [focusedField, setFocusedField] = useState<'name' | 'value' | null>(
    null,
  );
  const { nodes, edges, updateVariableNode } = useFlowStore(
    useShallow(selector),
  );

  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );

  const handleNameChange = useCallback(
    (newName: string) => {
      updateVariableNode(id, { name: newName, value });
    },
    [id, value, updateVariableNode],
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      updateVariableNode(id, { name, value: newValue });
    },
    [id, name, updateVariableNode],
  );

  const {
    onCursorPositionChange: onNameCursorChange,
    insertTextAtCursor: insertTextIntoName,
  } = useTextInsert(varNameRef, name, handleNameChange);

  const {
    onCursorPositionChange: onValueCursorChange,
    insertTextAtCursor: insertTextIntoValue,
  } = useTextInsert(varValueRef, value, handleValueChange);

  const onVarNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value: newName, selectionStart, selectionEnd },
      } = e;
      updateVariableNode(id, { name: newName, value });

      requestAnimationFrame(() => {
        if (varNameRef.current) {
          varNameRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    },
    [id, value, updateVariableNode],
  );

  const onVarValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value: newValue, selectionStart, selectionEnd },
      } = e;
      updateVariableNode(id, { name, value: newValue });

      requestAnimationFrame(() => {
        if (varValueRef.current) {
          varValueRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    },
    [id, name, updateVariableNode],
  );

  const insertContextValue = useCallback(
    (contextKey: string) => {
      if (focusedField === 'name') {
        insertTextIntoName(contextKey);
      } else if (focusedField === 'value') {
        insertTextIntoValue(`%${contextKey}%`);
      } else {
        insertTextIntoValue(`%${contextKey}%`);
      }
    },
    [focusedField, insertTextIntoName, insertTextIntoValue],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Variable
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <ConnectionHandle
          id="variable-target"
          type="target"
          position={Position.Top}
          connectionLimit={1}
        />
        <p>Set/Override</p>
        <input
          ref={varNameRef}
          type="text"
          className="border border-amber-600 w-full bg-white p-1 rounded text-center nodrag"
          value={name}
          onChange={onVarNameChange}
          onClick={onNameCursorChange}
          onKeyUp={onNameCursorChange}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
        />
        <p>To value</p>
        <input
          ref={varValueRef}
          type="text"
          className="border border-amber-600 w-full bg-white p-1 rounded text-center nodrag"
          value={value}
          onChange={onVarValueChange}
          onClick={onValueCursorChange}
          onKeyUp={onValueCursorChange}
          onFocus={() => setFocusedField('value')}
          onBlur={() => setFocusedField(null)}
        />
        <div>
          <p className="text-sm">
            Context Values - click to insert into focused field
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
                title={`Click to insert ${x[0]} into focused field`}
              >
                {x[0]} - {x[1]}
              </p>
            ))}
          </div>
        </div>
        <ConnectionHandle
          id="variable-source"
          type="source"
          position={Position.Bottom}
          connectionLimit={1}
        />
      </BaseNodeContent>
    </BaseNode>
  );
};
