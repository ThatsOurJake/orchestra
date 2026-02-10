import { mdiFloppy } from '@mdi/js';
import Icon from '@mdi/react';
import { type Node, useReactFlow } from '@xyflow/react';
import type React from 'react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/react/shallow';
import { getNodeId } from '../../utils/flow-helpers';
import { useStore } from '../store';
import { type AppNodes, type AppState, useFlowStore } from './flow-store';

interface ToolkitNodeProps {
  children: React.ReactElement;
  nodeType: AppNodes['type'];
  onClick: (nodeType: AppNodes['type']) => void;
}

const ToolkitNode = ({ nodeType, onClick, children }: ToolkitNodeProps) => {
  const _onClick = useCallback(() => {
    onClick(nodeType);
  }, [nodeType, onClick]);

  return (
    <button
      className="border border-black rounded text-center p-2 bg-white cursor-pointer"
      onClick={_onClick}
      type="button"
    >
      {children}
    </button>
  );
};

const selector = (state: AppState) => ({
  nodes: state.nodes,
  exportToJSON: state.exportToJSON,
});

export const Sidebar = () => {
  const { setNodes, screenToFlowPosition } = useReactFlow();
  const { nodes, exportToJSON } = useFlowStore(useShallow(selector));
  const addFlow = useStore((state) => state.addFlow);

  const handleClick = useCallback(
    (nodeType: AppNodes['type']) => {
      const hasStartingNode =
        nodes.find((n) => n.type === 'parameters') && nodeType === 'parameters';
      const hasEndingNode =
        nodes.find((n) => n.type === 'endNode') && nodeType === 'endNode';

      if (hasStartingNode) {
        toast('Cannot create another starting node', {
          type: 'warning',
          pauseOnHover: false,
        });

        return;
      }

      if (hasEndingNode) {
        toast('Cannot create another ending node', {
          type: 'warning',
          pauseOnHover: false,
        });

        return;
      }

      // Calculate center position of screen in flow coordinates
      const { innerWidth, innerHeight } = window;
      const centerPosition = screenToFlowPosition({
        x: innerWidth / 2,
        y: innerHeight / 2,
      });

      const newNode: Node = {
        id: getNodeId(nodeType),
        type: nodeType,
        position: centerPosition,
        data: {},
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, nodes, screenToFlowPosition],
  );

  const onFlowSave = useCallback(() => {
    const hasStartingNode = nodes.find((n) => n.type === 'parameters');
    const hasEndingNode = nodes.find((n) => n.type === 'endNode');

    if (!hasStartingNode || !hasEndingNode) {
      toast('Flow not saved: Must have a Starting and Ending node', {
        type: 'error',
        pauseOnHover: false,
      });

      return;
    }

    const flowName = prompt('Flow Name');

    if (!flowName || flowName.trim().length === 0) {
      toast('Flow not saved: Name must be provided', {
        type: 'warning',
        pauseOnHover: false,
      });
      return;
    }

    const json = exportToJSON();

    addFlow({
      name: flowName,
      id: crypto.randomUUID(),
      flowData: json,
      createdAt: Date.now(),
    });

    toast(`Successfully stored: "${flowName}"`, {
      type: 'success',
      pauseOnHover: false,
    });
  }, [addFlow, exportToJSON, nodes]);

  return (
    <aside>
      <p className="text-center text-2xl">Toolbox</p>
      <p className="text-xs text-center mb-2">
        Click a node to add it to the screen!
      </p>
      <button
        title="Save Flow"
        className="cursor-pointer flex gap-x-2 border border-black px-2 py-0.5 w-full rounded bg-orange-200 hover:underline"
        onClick={onFlowSave}
        type="button"
      >
        <Icon path={mdiFloppy} size={1} color="#000000" />
        <p>Save Flow</p>
      </button>
      <div className="h-px my-2 bg-orange-300" />
      <section className="my-2 flex flex-col gap-y-2">
        <ToolkitNode nodeType="parameters" onClick={handleClick}>
          <p>Starting Node</p>
        </ToolkitNode>
        <ToolkitNode nodeType="createAgent" onClick={handleClick}>
          <p>Create Agent</p>
        </ToolkitNode>
        <ToolkitNode nodeType="sendMessageToAgent" onClick={handleClick}>
          <p>Send message to agent</p>
        </ToolkitNode>
        <ToolkitNode nodeType="conditional" onClick={handleClick}>
          <p>Conditional</p>
        </ToolkitNode>
        <ToolkitNode nodeType="extractString" onClick={handleClick}>
          <p>Extract String</p>
        </ToolkitNode>
        <ToolkitNode nodeType="endNode" onClick={handleClick}>
          <p>Ending Node</p>
        </ToolkitNode>
      </section>
    </aside>
  );
};
