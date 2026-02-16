import { mdiExportVariant, mdiPencilBox, mdiTrashCan } from '@mdi/js';
import { Icon } from '@mdi/react';
import { timeAgo } from '../utils/string-helpers';
import type { StoredFlow } from './store';

export interface SavedFlowCardProps {
  flow: StoredFlow;
  onExportFlow: (flowId: string) => void;
  onEditFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
}

export const SavedFlowCard = ({
  flow: { createdAt, id, name, lastEditedAt },
  onExportFlow,
  onEditFlow,
  onDeleteFlow,
}: SavedFlowCardProps) => {
  const readableDate = new Date(createdAt).toDateString();

  return (
    <div className="bg-orange-200 border border-black rounded p-2 flex-[0_0_calc(33.333%-0.5rem)] min-w-0 overflow-hidden">
      <div className="flex flex-row justify-between items-center mb-1 min-w-0 gap-2">
        <p className="text-xl font-bold truncate min-w-0 flex-1">{name}</p>
        <div className="flex items-center shrink-0">
          <button
            type="button"
            className="cursor-pointer"
            title="Export Flow"
            onClick={() => onExportFlow(id)}
          >
            <Icon path={mdiExportVariant} size={1.5} />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            title="Edit flow"
            onClick={() => onEditFlow(id)}
          >
            <Icon path={mdiPencilBox} size={1.5} />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            title="Delete flow"
            onClick={() => onDeleteFlow(id)}
          >
            <Icon path={mdiTrashCan} size={1.5} />
          </button>
        </div>
      </div>
      <p title={readableDate} className="text-sm">
        Created {timeAgo(createdAt)}
        {lastEditedAt && <span> | Last edited {timeAgo(lastEditedAt)}</span>}
      </p>
    </div>
  );
};
