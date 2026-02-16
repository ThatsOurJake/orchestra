import { mdiCancel, mdiFloppy } from '@mdi/js';
import Icon from '@mdi/react';
import { type Node, useReactFlow } from '@xyflow/react';
import type React from 'react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/react/shallow';
import { nodeIdHelper } from '../../utils/flow-helpers';
import { type MainStore, useStore } from '../store';
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
  exportFlowData: state.exportFlowData,
  projectSettings: state.projectSettings,
  setProjectSavedValue: state.setProjectSavedValue,
  setProjectSettings: state.setProjectSettings,
  resetProjectSettings: state.resetProjectSettings,
});

const mainStoreSelector = (state: MainStore) => ({
  addFlow: state.addFlow,
  updateFlow: state.updateFlow,
});

export const Sidebar = () => {
  const { setNodes, setEdges, screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    exportFlowData,
    projectSettings,
    setProjectSavedValue,
    setProjectSettings,
    resetProjectSettings,
  } = useFlowStore(useShallow(selector));
  const { addFlow, updateFlow } = useStore(useShallow(mainStoreSelector));

  const handleClick = useCallback(
    (nodeType: AppNodes['type']) => {
      const hasStartingNode =
        nodes.find((n) => n.type === 'parameters') && nodeType === 'parameters';

      if (hasStartingNode) {
        toast('Cannot create another starting node', {
          type: 'warning',
        });

        return;
      }

      const { innerWidth, innerHeight } = window;
      const centerPosition = screenToFlowPosition({
        x: innerWidth / 2,
        y: innerHeight / 2,
      });

      const newNode: Node = {
        id: nodeIdHelper.getNodeId(nodeType),
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
      toast('Flow not saved: Must have a Starting and at least 1 Ending node', {
        type: 'error',
      });

      return;
    }

    const flowData = exportFlowData();

    if (projectSettings.loadedId) {
      const { flow } = flowData;
      updateFlow(projectSettings.loadedId, flow);
      toast(`Successfully updated: "${projectSettings.loadedName}"`, {
        type: 'success',
      });
      setProjectSavedValue(true);
      return;
    }

    const flowName = prompt('Flow Name');

    if (!flowName || flowName.trim().length === 0) {
      toast('Flow not saved: Name must be provided', {
        type: 'warning',
      });
      return;
    }

    const flowId = crypto.randomUUID();

    addFlow({
      name: flowName,
      id: flowId,
      flowData: flowData.flow,
      createdAt: Date.now(),
    });

    toast(`Successfully stored: "${flowName}"`, {
      type: 'success',
    });

    setProjectSettings(flowId, flowName);
  }, [
    addFlow,
    exportFlowData,
    nodes,
    setProjectSavedValue,
    setProjectSettings,
    projectSettings,
    updateFlow,
  ]);

  const onClear = useCallback(() => {
    const confirmation = confirm(
      "Are you sure you'd like to clear the project?",
    );

    if (confirmation) {
      setEdges([]);
      setNodes([]);
      resetProjectSettings();
      nodeIdHelper.resetId();
    }
  }, [setEdges, setNodes, resetProjectSettings]);

  return (
    <aside className="px-2">
      <p className="text-center text-2xl">Toolbox</p>
      <p className="text-xs text-center mb-2">
        Click a node to add it to the screen!
      </p>
      {projectSettings.loadedName && (
        <p className="py-2 text-xs">Project: {projectSettings.loadedName}</p>
      )}
      <button
        title="Save Flow"
        className="cursor-pointer flex gap-x-2 border border-black px-2 py-2 w-full rounded bg-orange-200 hover:underline"
        onClick={onFlowSave}
        type="button"
      >
        <Icon path={mdiFloppy} size={1} color="#000000" />
        <p>Save Flow</p>
      </button>
      <button
        title="Clear Project"
        className="cursor-pointer flex gap-x-2 border border-black px-2 py-2 w-full rounded bg-purple-200 hover:underline mt-2"
        onClick={onClear}
        type="button"
      >
        <Icon path={mdiCancel} size={1} color="#000000" />
        <p>Clear Project</p>
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
        <ToolkitNode nodeType="variable" onClick={handleClick}>
          <p>Variable</p>
        </ToolkitNode>
        <ToolkitNode nodeType="askForInput" onClick={handleClick}>
          <p>Ask for User Input</p>
        </ToolkitNode>
        <ToolkitNode nodeType="outputNode" onClick={handleClick}>
          <p>Output to main</p>
        </ToolkitNode>
        <ToolkitNode nodeType="endNode" onClick={handleClick}>
          <p>Ending Node</p>
        </ToolkitNode>
      </section>
    </aside>
  );
};
