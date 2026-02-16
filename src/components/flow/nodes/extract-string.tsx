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

export type ExtractStringNodeProps = Node<
  {
    regex: string;
    from: string;
  },
  'extractString'
>;

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  updateExtractStringNode: state.updateExtractStringNode,
});

export const ExtractStringNode = ({
  id,
  data: { regex = '', from = 'default' },
}: NodeProps<ExtractStringNodeProps>) => {
  const { nodes, edges, updateExtractStringNode } = useFlowStore(
    useShallow(selector),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );
  const strProps = useMemo(
    () => contextProps.filter(([_key, type]) => type === 'string'),
    [contextProps],
  );

  const onRegexChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value, selectionStart, selectionEnd },
      } = e;
      updateExtractStringNode(id, { from, regex: value });

      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    },
    [from, id, updateExtractStringNode],
  );

  const onSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const {
        target: { value },
      } = e;
      updateExtractStringNode(id, {
        regex,
        from: value,
      });
    },
    [updateExtractStringNode, id, regex],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Extract String (Regex)
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <BaseHandle
          id="extract-string-target"
          type="target"
          position={Position.Top}
        />
        <select
          className="border border-amber-200 p-0.5 rounded"
          value={from}
          onChange={onSelectChange}
        >
          <option disabled value="default">
            Select from context
          </option>
          {strProps.map((a, index) => (
            <option key={`${id}-prop-${index}`} value={a[0]}>
              {a[0]}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="text"
          className="border border-amber-600 w-full bg-white p-1 rounded text-center nodrag"
          placeholder="Regex"
          value={regex}
          onChange={onRegexChange}
        />
        <p className="text-xs text-gray-400 text-center">
          Regex will execute with "i" flags
        </p>
        <ConnectionHandle
          id="extract-string-source"
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
