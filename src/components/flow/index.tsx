import type { DefaultEdgeOptions } from '@xyflow/react';
import { Background, Controls, ReactFlow, useReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { nodeIdHelper } from '../../utils/flow-helpers';
import { useCurrentTab } from '../tabs/context';

import { type AppNodes, type AppState, useFlowStore } from './flow-store';
import { ConditionalNode } from './nodes/conditional';
import { CreateAgentNode } from './nodes/create-agent';
import { EndNode } from './nodes/end';
import { ExtractStringNode } from './nodes/extract-string';
import { OutputNode } from './nodes/output';
import { ParametersNode } from './nodes/parameters';
import { SendMessageToAgentNode } from './nodes/send-message-to-agent';
import { VariableNode } from './nodes/variable';
import { Sidebar } from './sidebar';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
  parameters: ParametersNode,
  createAgent: CreateAgentNode,
  sendMessageToAgent: SendMessageToAgentNode,
  conditional: ConditionalNode,
  extractString: ExtractStringNode,
  endNode: EndNode,
  variable: VariableNode,
  outputNode: OutputNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  interactive: state.interactive,
  setNodes: state.setNodes,
});

export const Flow = () => {
  const currentTab = useCurrentTab();
  const flowInstance = useReactFlow();
  const copiedNodesRef = useRef<AppNodes[]>([]);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    interactive,
    setNodes,
  } = useFlowStore(useShallow(selector));

  const getSelectedNodes = useCallback(() => {
    return nodes.filter((node) => node.selected);
  }, [nodes]);

  const handleCopy = useCallback(() => {
    const selectedNodes = getSelectedNodes();
    const filteredNodes = selectedNodes.filter(
      (x) => x.type !== 'parameters' && x.type !== 'endNode',
    );

    if (filteredNodes.length > 0) {
      copiedNodesRef.current = filteredNodes;
    }
  }, [getSelectedNodes]);

  const handlePaste = useCallback(() => {
    if (copiedNodesRef.current.length === 0) return;

    const { zoom } = flowInstance.getViewport();
    const offset = 50 / zoom;

    const newNodes: AppNodes[] = copiedNodesRef.current.map((node) => {
      const newId = nodeIdHelper.getNodeId(node.type);

      return {
        id: newId,
        type: node.type,
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset,
        },
        data: node.data,
        selected: true,
        ...(node.width && { width: node.width }),
        ...(node.height && { height: node.height }),
        ...(node.style && { style: node.style }),
      } as AppNodes;
    });

    const updatedExistingNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));

    setNodes([...updatedExistingNodes, ...newNodes] as AppNodes[]);
    copiedNodesRef.current = newNodes;
  }, [nodes, flowInstance, setNodes]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't intercept copy/paste if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const isModifierKey = event.ctrlKey || event.metaKey;

      if (isModifierKey && event.key === 'c') {
        event.preventDefault();
        handleCopy();
      } else if (isModifierKey && event.key === 'v') {
        event.preventDefault();
        handlePaste();
      }
    },
    [handleCopy, handlePaste],
  );

  useEffect(() => {
    if (currentTab === 1) {
      setTimeout(() => flowInstance.fitView(), 0);
    }
  }, [currentTab, flowInstance]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="flex w-full h-full">
      <div className="grow shrink">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeTypes={nodeTypes}
          nodesDraggable={interactive}
          panOnDrag={interactive}
          zoomOnScroll={interactive}
          zoomOnDoubleClick={interactive}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="w-32 md:w-52 shadow">
        <Sidebar />
      </div>
    </div>
  );
};
