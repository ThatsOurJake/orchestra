import { mdiArrowDown, mdiArrowUp, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/react/shallow';
import { timeAgo } from '../../utils/string-helpers';
import { OutputDisplay } from '../output-display';
import { type ChatHistory, type MainStore, useStore } from '../store';

const selector = (state: MainStore) => ({
  chatHistory: state.chatHistory,
  deleteChatHistory: state.deleteChatHistory,
});

interface ChatHistoryItemProps {
  history: ChatHistory;
  onDelete: (historyId: string) => void;
}

const ChatHistoryItem = ({ history, onDelete }: ChatHistoryItemProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const { id, flowName, completedAt, outputs } = history;

  const classes = classnames({
    'w-full': true,
    border: true,
    'border-black': true,
    rounded: true,
    'p-2': true,
    'bg-white': true,
    'h-18': collapsed,
    'overflow-hidden': collapsed,
  });

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleDelete = useCallback(() => {
    const confirmation = confirm(
      `Are you sure you want to delete the history for "${flowName}"?`,
    );

    if (confirmation) {
      onDelete(id);
      toast(`History for "${flowName}" has been deleted`, {
        type: 'info',
        icon: () => <Icon path={mdiTrashCan} size={1} color="#000000" />,
      });
    }
  }, [id, flowName, onDelete]);

  const readableDate = new Date(completedAt).toDateString();

  return (
    <div className={classes}>
      <button
        className="w-full flex justify-between items-center cursor-pointer"
        onClick={toggleCollapse}
        type="button"
      >
        <div className="flex flex-col items-start">
          <p className="font-bold text-xl">{flowName}</p>
          <p className="text-sm text-gray-600" title={readableDate}>
            Completed {timeAgo(completedAt)}
          </p>
        </div>
        {collapsed && <Icon path={mdiArrowDown} size={1} color="#000000" />}
        {!collapsed && <Icon path={mdiArrowUp} size={1} color="#000000" />}
      </button>

      {!collapsed && (
        <>
          <div className="mt-4 mb-4 max-h-96 overflow-y-auto">
            <OutputDisplay
              outputs={outputs}
              emptyMessage="No outputs in this history"
            />
          </div>
          <div className="flex gap-x-2 justify-center">
            <button
              className="w-1/3 py-2 border border-black rounded cursor-pointer bg-red-300 hover:underline"
              onClick={handleDelete}
              type="button"
            >
              <p>Delete History</p>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export const ChatHistoryScreen = () => {
  const { chatHistory, deleteChatHistory } = useStore(useShallow(selector));

  // Sort by most recent first
  const sortedHistory = [...chatHistory].sort(
    (a, b) => b.completedAt - a.completedAt,
  );

  return (
    <div className="max-w-full overflow-x-hidden">
      {sortedHistory.length === 0 && (
        <p className="text-center py-2">You currently have no chat history.</p>
      )}
      <div className="my-2 gap-4 flex flex-col">
        {sortedHistory.map((history) => (
          <ChatHistoryItem
            key={history.id}
            history={history}
            onDelete={deleteChatHistory}
          />
        ))}
      </div>
    </div>
  );
};
