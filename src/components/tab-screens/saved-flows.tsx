import { mdiFileImport } from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/react/shallow';
import { useFileImportModalStore } from '../file-import-modal/file-import-modal-store';
import { type AppState, useFlowStore } from '../flow/flow-store';
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
});

export const SavedFlows = () => {
  const { storedFlows, deleteFlow, addFlow } = useStore(
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

      const dataStr = JSON.stringify(flow, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${flow.name}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [storedFlows],
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

    // We will remove lastEdit and use the current createdAt time as this flow is now the users
    result.createdAt = Date.now();
    if (result.lastEditedAt) {
      result.lastEditedAt = undefined;
    }

    addFlow(result);
    toast(`"${result.name}" imported successfully`, {
      type: 'success',
    });
  }, [openModal, storedFlows, addFlow]);

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
