import { timeAgo } from '../../../utils/string-helpers';
import type { StoredFlow } from '../../store';

interface FlowSelectionProps {
  storedFlows: StoredFlow[];
  onFlowSelect: (flow: StoredFlow) => void;
}

export const FlowSelection = ({
  storedFlows,
  onFlowSelect,
}: FlowSelectionProps) => {
  return (
    <div className="w-full h-full overflow-y-auto">
      <p className="text-xl font-semibold">Select a flow to get started!</p>
      {storedFlows.length === 0 && <p>There are currently no flows stored!</p>}
      <div className="my-2 grid grid-cols-3">
        {storedFlows.map((s) => (
          <button
            type="button"
            onClick={() => onFlowSelect(s)}
            className="m-2 p-4 flex flex-col justify-center items-center border-indigo-600 bg-indigo-300 border rounded-md cursor-pointer hover:underline"
            key={s.id}
          >
            <p>{s.name}</p>
            <p>Created: {timeAgo(s.createdAt)}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
