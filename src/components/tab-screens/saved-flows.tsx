import { mdiPencilBox, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/react/shallow';
import { timeAgo } from '../../utils/string-helpers';
import { type AppState, useFlowStore } from '../flow/flow-store';
import { type MainStore, useStore } from '../store';
import { useChangeTab } from '../tabs/context';

const selector = (state: AppState) => ({
  projectSettings: state.projectSettings,
  nodes: state.nodes,
  importFlowData: state.importFlowData,
});

const mainStoreSelector = (state: MainStore) => ({
  storedFlows: state.storedFlows,
  deleteFlow: state.deleteFlow,
});

export const SavedFlows = () => {
  const { storedFlows, deleteFlow } = useStore(useShallow(mainStoreSelector));
  const { projectSettings, nodes, importFlowData } = useFlowStore(
    useShallow(selector),
  );
  const changeTab = useChangeTab();

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

  return (
    <>
      {storedFlows.length === 0 && (
        <p className="text-center py-2">You currently have no flows stored.</p>
      )}
      <div className="my-2 gap-2 flex flex-row flex-wrap">
        {storedFlows.map((x) => {
          const readableDate = new Date(x.createdAt).toDateString();
          return (
            <div
              className="bg-orange-200 border border-black rounded p-2 basis-1/3"
              key={x.id}
            >
              <div className="flex flex-row justify-between items-center">
                <p className="text-xl font-bold">{x.name}</p>
                <div>
                  <button
                    type="button"
                    className="cursor-pointer"
                    title="Edit flow"
                    onClick={() => onEditFlow(x.id)}
                  >
                    <Icon path={mdiPencilBox} size={1.5} />
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer"
                    title="Delete flow"
                    onClick={() => onDeleteFlow(x.id)}
                  >
                    <Icon path={mdiTrashCan} size={1.5} />
                  </button>
                </div>
              </div>
              <p title={readableDate} className="text-sm">
                Created {timeAgo(x.createdAt)}
                {x.lastEditedAt && (
                  <span> | Last edited {timeAgo(x.lastEditedAt)}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};
