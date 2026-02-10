import { type Node, type NodeProps, Position } from '@xyflow/react';
import { type ChangeEvent, useCallback } from 'react';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/shadcn/base-node';
import { ConnectionHandle } from '../connection-handle';
import { useFlowStore } from '../flow-store';

export interface Parameter {
  name: string;
  type: 'string' | 'number';
}

export type ParametersNodeProps = Node<
  {
    params: Parameter[];
  },
  'parameters'
>;

interface ParameterInputProps {
  index: number;
  nodeId: string;
  data: Parameter;
  update: (index: number, key: keyof Parameter, value: string) => void;
  remove: (index: number) => void;
}

const ParameterInput = ({
  data,
  update,
  index,
  remove,
}: ParameterInputProps) => {
  const { name, type } = data;

  const onUpdateName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = e;
      const trimmed = value.trim();
      update(index, 'name', trimmed);
    },
    [index, update],
  );

  const onUpdateType = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const {
        target: { value },
      } = e;
      update(index, 'type', value);
    },
    [index, update],
  );

  const onRemove = useCallback(() => remove(index), [remove, index]);

  return (
    <div className="not-last:border-b not-last:pb-2 not-first:mt-2">
      <label htmlFor="param-name">Name:</label>
      <input
        type="text"
        id="param-name"
        autoComplete="off"
        data-lpignore="true"
        data-form-type="other"
        className="border mx-0.5 w-full rounded p-0.5 nodrag"
        value={name}
        onChange={onUpdateName}
      />
      <label className="mt-2" htmlFor="param-type">
        Type:
      </label>
      <select
        value={type}
        className="border mx-0.5 w-full rounded p-0.5"
        onChange={onUpdateType}
      >
        <option value="string">string</option>
        <option value="number">number</option>
      </select>
      <button
        className="w-full py-0.5 mt-2 bg-red-400 hover:underline rounded border cursor-pointer nodrag text-xs"
        onClick={onRemove}
        type="button"
      >
        Remove Parameter
      </button>
    </div>
  );
};

export const ParametersNode = ({
  id,
  data,
}: NodeProps<ParametersNodeProps>) => {
  const updateParametersNode = useFlowStore(
    (state) => state.updateParametersNode,
  );
  const { params = [] } = data;

  const addParameter = useCallback(() => {
    const copy = params.slice();

    copy.push({
      name: 'placeholder',
      type: 'string',
    });

    updateParametersNode(id, copy);
  }, [updateParametersNode, params, id]);

  const removeParameter = useCallback(
    (index: number) => {
      const copy = params.slice();
      copy.splice(index, 1);
      updateParametersNode(id, copy);
    },
    [updateParametersNode, params, id],
  );

  const updateParameter = useCallback(
    (index: number, key: keyof Parameter, value: string) => {
      const copy = params.slice();

      switch (key) {
        case 'name':
          copy[index].name = value;
          break;
        case 'type':
          copy[index].type = value as Parameter['type'];
          break;
      }

      updateParametersNode(id, copy);
    },
    [params, updateParametersNode, id],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Starting Node
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <div>
          {params.map((p, idx) => (
            <ParameterInput
              data={p}
              key={`parameter-${idx}`}
              nodeId={id}
              index={idx}
              update={updateParameter}
              remove={removeParameter}
            />
          ))}
        </div>
        <ConnectionHandle
          id="parameters-source"
          type="source"
          position={Position.Right}
          connectionLimit={1}
        />
      </BaseNodeContent>
      <BaseNodeFooter className="border-t">
        <button
          className="w-full py-1 bg-orange-400 hover:underline rounded-md border cursor-pointer nodrag"
          onClick={addParameter}
          type="button"
        >
          Add Parameter
        </button>
      </BaseNodeFooter>
    </BaseNode>
  );
};
