import { mdiArrowDown, mdiArrowUp, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type Agent, useStore } from '../store';

interface AgentOverviewProps {
  agent: Agent;
}

export const AgentOverview = ({ agent }: AgentOverviewProps) => {
  const { removeAgent, updateAgent } = useStore();
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const { id, name, prompt } = agent;

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

  const onDelete = useCallback(() => {
    removeAgent(id);

    toast(`Agent "${name}" has been removed`, {
      type: 'info',
      icon: () => <Icon path={mdiTrashCan} size={1} color="#000000" />,
    });
  }, [id, name, removeAgent]);

  const onUpdate = useCallback(() => {
    const newPrompt = promptRef.current!.value;

    if (newPrompt === prompt) {
      return;
    }

    updateAgent({
      id,
      name,
      prompt: newPrompt,
    });

    toast(`Agent "${name}" has been updated`, {
      type: 'info',
    });
  }, [prompt, updateAgent, id, name]);

  return (
    <div className={classes}>
      <button
        className="w-full flex justify-between items-center cursor-pointer"
        onClick={toggleCollapse}
        type="button"
      >
        <p className="font-bold text-xl">{name}</p>
        {collapsed && <Icon path={mdiArrowDown} size={1} color="#000000" />}
        {!collapsed && <Icon path={mdiArrowUp} size={1} color="#000000" />}
      </button>
      <p className="italic text-sm mb-4">ID: {id}</p>
      <textarea
        className="border border-amber-600 w-full resize-y min-h-60 bg-white p-1 rounded"
        defaultValue={prompt}
        ref={promptRef}
      />
      <div className="flex gap-x-2 justify-center">
        <button
          className="w-1/3 py-2 border border-black rounded cursor-pointer bg-amber-300 hover:underline"
          onClick={onUpdate}
          type="button"
        >
          <p>Update Agent</p>
        </button>
        <button
          className="w-1/3 py-2 border border-black rounded cursor-pointer bg-red-300 hover:underline"
          onClick={onDelete}
          type="button"
        >
          <p>Delete Agent</p>
        </button>
      </div>
    </div>
  );
};
