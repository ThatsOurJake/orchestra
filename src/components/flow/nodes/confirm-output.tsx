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

export type ConfirmOutputNodeProps = Node<
  {
    label?: string;
    contentKey?: string;
  },
  'confirmOutput'
>;

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setInteractive: state.setInteractive,
  updateConfirmOutputNode: state.updateConfirmOutputNode,
});

export const ConfirmOutputNode = ({
  id,
  data: { label = '', contentKey = '' },
}: NodeProps<ConfirmOutputNodeProps>) => {
  const { nodes, edges, setInteractive, updateConfirmOutputNode } =
    useFlowStore(useShallow(selector));

  const labelRef = useRef<HTMLInputElement>(null);

  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );

  const handleLabelChange = useCallback(
    (newLabel: string) => {
      updateConfirmOutputNode(id, { label: newLabel });
    },
    [id, updateConfirmOutputNode],
  );

  const { onCursorPositionChange, insertTextAtCursor } = useTextInsert(
    labelRef,
    label,
    handleLabelChange,
  );

  const onLabelChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value, selectionStart, selectionEnd },
      } = e;
      updateConfirmOutputNode(id, { label: value });
      requestAnimationFrame(() => {
        if (labelRef.current) {
          labelRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    },
    [id, updateConfirmOutputNode],
  );

  const onContentKeyChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      updateConfirmOutputNode(id, { contentKey: e.target.value });
    },
    [id, updateConfirmOutputNode],
  );

  const onFocus = useCallback(() => {
    setInteractive(false);
  }, [setInteractive]);

  const onBlur = useCallback(() => {
    setInteractive(true);
  }, [setInteractive]);

  const insertContextValue = useCallback(
    (key: string) => {
      insertTextAtCursor(`%${key}%`);
    },
    [insertTextAtCursor],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Review Content
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <BaseHandle
          id="confirm-output-target"
          type="target"
          position={Position.Top}
        />

        <label
          htmlFor={`${id}-label`}
          className="text-sm font-medium mb-1 block"
        >
          Label (optional)
        </label>
        <input
          id={`${id}-label`}
          ref={labelRef}
          type="text"
          className="border border-amber-200 p-1 rounded w-full mb-3 nodrag"
          placeholder="e.g. Is this output acceptable?"
          value={label}
          onChange={onLabelChange}
          onClick={onCursorPositionChange}
          onKeyUp={onCursorPositionChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        <label
          htmlFor={`${id}-contentKey`}
          className="text-sm font-medium mb-1 block"
        >
          Content to review
        </label>
        <select
          id={`${id}-contentKey`}
          className="border border-amber-200 p-1 rounded w-full bg-white nodrag"
          value={contentKey}
          onChange={onContentKeyChange}
        >
          <option value="">Select from context</option>
          {contextProps.map((x) => (
            <option key={x[0]} value={x[0]}>
              {x[0]} ({x[1]})
            </option>
          ))}
        </select>

        <div className="mt-3">
          <p className="text-sm">Context Values - click to insert into label</p>
          <div className="flex flex-wrap gap-2">
            {contextProps.map((x) => (
              <p
                className="text-xs text-gray-400 italic cursor-pointer hover:text-amber-600 hover:bg-amber-50 px-1 rounded transition-colors nodrag"
                key={x[0]}
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
      </BaseNodeContent>
      <div className="flex justify-between border-t py-2">
        <ConnectionLabelHandle
          id="confirm-output-approved"
          type="source"
          position={Position.Left}
          connectionLimit={2}
          title="Approved"
        />
        <ConnectionLabelHandle
          id="confirm-output-rejected"
          type="source"
          position={Position.Right}
          connectionLimit={2}
          title="Rejected"
        />
      </div>
    </BaseNode>
  );
};
