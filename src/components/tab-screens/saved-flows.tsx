import { mdiFileImport } from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/react/shallow';
import { isCreateAgentNode } from '../../utils/flow-helpers';
import { useFileImportModalStore } from '../file-import-modal/file-import-modal-store';
import { type AppNodes, type AppState, useFlowStore } from '../flow/flow-store';
import { SavedFlowCard } from '../saved-flow-card';
import { type MainStore, type StoredFlow, useStore } from '../store';
import { useChangeTab } from '../tabs/context';

const selector = (state: AppState) => ({
  projectSettings: state.projectSettings,
  nodes: state.nodes,
  importFlowData: state.importFlowData,
});

const mainStoreSelector = (state: MainStore) => ({
  storedFlows: state.storedFlows,
  deleteFlow: state.deleteFlow,
  addFlow: state.addFlow,
  agents: state.agents,
  addAgentWithId: state.addAgentWithId,
});

export const SavedFlows = () => {
  const { storedFlows, deleteFlow, addFlow, agents, addAgentWithId } = useStore(
    useShallow(mainStoreSelector),
  );
  const { projectSettings, nodes, importFlowData } = useFlowStore(
    useShallow(selector),
  );
  const changeTab = useChangeTab();
  const { openModal } = useFileImportModalStore();

  const onEditFlow = useCallback(
    (flowId: string) => {
      const flow = storedFlows.find((x) => x.id === flowId);

      if (!flow) {
        return;
      }

      if (!projectSettings.savedSinceEdits && nodes.length > 0) {
        const overrideConfirm = confirm(
          'There are edits within the flow editor, override them?',
        );

        if (!overrideConfirm) {
          return;
        }
      }

      importFlowData(flow);
      toast('Flow loaded', {
        type: 'success',
      });
      changeTab(1);
    },
    [projectSettings, nodes, storedFlows, importFlowData, changeTab],
  );

  const onDeleteFlow = useCallback(
    (flowId: string) => {
      const flow = storedFlows.find((x) => x.id === flowId);

      if (!flow) {
        return;
      }

      const confirmation = confirm(
        `Are you sure you want to delete "${flow.name}"?`,
      );

      if (confirmation) {
        deleteFlow(flowId);
      }
    },
    [deleteFlow, storedFlows],
  );

  const onExportFlow = useCallback(
    (flowId: string) => {
      const flow = storedFlows.find((x) => x.id === flowId);

      if (!flow) {
        return;
      }

      const parsedFlowData = JSON.parse(flow.flowData) as { nodes: AppNodes[] };
      const agentNodes = parsedFlowData.nodes.filter((x) =>
        isCreateAgentNode(x),
      );

      for (const node of agentNodes) {
        const agentId = node.data.selectedAgent?.agent.id;
        const foundAgent = agents.find((x) => x.id === agentId);

        if (!foundAgent) {
          console.warn(`Cannot find agent by id: ${agentId}`);
          continue;
        }

        // The prompt could change but the one stored is a snapshot of the time of creation, so we update it at time of export.
        node.data.selectedAgent!.agent.prompt = foundAgent.prompt;
        node.data.selectedAgent!.agent.name = foundAgent.name;
      }

      flow.flowData = JSON.stringify(parsedFlowData);

      const dataStr = JSON.stringify(flow, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${flow.name}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [storedFlows, agents],
  );

  const onImport = useCallback(async () => {
    const result = await openModal<StoredFlow>('Import Flow');

    if (!result) {
      return;
    }

    if (!result.name || !result.id || !result.flowData) {
      toast('Invalid flow file: missing required fields', {
        type: 'error',
      });
      return;
    }

    if (storedFlows.some((flow) => flow.id === result.id)) {
      toast('A flow with this ID already exists', {
        type: 'error',
      });
      return;
    }

    result.createdAt = Date.now();
    if (result.lastEditedAt) {
      result.lastEditedAt = undefined;
    }

    const flowData = JSON.parse(result.flowData) as { nodes: AppNodes[] };
    const foundAgents = flowData.nodes.filter((x) => isCreateAgentNode(x));
    const nonImportedAgents = foundAgents.filter((a) => {
      const {
        data: { selectedAgent },
      } = a;
      const {
        agent: { id: selectedAgentId },
      } = selectedAgent!;
      return !agents.find((x) => x.id === selectedAgentId);
    });

    for (const toImportAgent of nonImportedAgents) {
      const {
        data: { selectedAgent },
      } = toImportAgent;
      const { agent } = selectedAgent!;
      addAgentWithId({
        id: agent.id,
        name: agent.name,
        prompt: agent.prompt,
      });
    }

    addFlow(result);
    toast(`"${result.name}" imported successfully`, {
      type: 'success',
    });
  }, [openModal, storedFlows, addFlow, agents, addAgentWithId]);

  return (
    <div className="max-w-full overflow-x-hidden">
      {storedFlows.length === 0 && (
        <p className="text-center py-2">You currently have no flows stored.</p>
      )}
      <div className="my-2 gap-2 flex flex-row flex-wrap max-w-full">
        {storedFlows.map((x) => {
          return (
            <SavedFlowCard
              flow={x}
              onDeleteFlow={onDeleteFlow}
              onEditFlow={onEditFlow}
              onExportFlow={onExportFlow}
              key={x.id}
            />
          );
        })}
        <button
          type="button"
          onClick={onImport}
          className="bg-blue-200 border border-black rounded p-2 flex-[0_0_calc(33.333%-0.5rem)] flex justify-center items-center flex-col cursor-pointer"
        >
          <Icon path={mdiFileImport} size={1.2} />
          <p>Import Flow</p>
        </button>
      </div>
    </div>
  );
};
