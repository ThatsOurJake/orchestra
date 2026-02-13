import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useStore } from '../store';

export const CreateAgent = () => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const addAgent = useStore((state) => state.addAgent);

  const handleSave = useCallback(() => {
    if (!name.trim() || !prompt.trim()) {
      return;
    }

    addAgent({
      name: name.trim(),
      prompt: prompt.trim(),
    });

    toast(`Successfully created agent: "${name.trim()}"`, {
      type: 'success',
    });

    // Clear form
    setName('');
    setPrompt('');
  }, [name, prompt, addAgent]);

  const isSaveDisabled = !name.trim() || !prompt.trim();

  return (
    <div className="flex flex-col gap-y-4 p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Create New Agent</h2>

      <div className="flex flex-col gap-y-2">
        <label htmlFor="agent-name" className="font-semibold">
          Agent Name
        </label>
        <input
          id="agent-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter agent name..."
          className="border border-amber-600 rounded px-3 py-2 focus:outline-none bg-white"
        />
      </div>

      <div className="flex flex-col gap-y-2">
        <label htmlFor="agent-prompt" className="font-semibold">
          Agent Prompt
        </label>
        <textarea
          id="agent-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter agent prompt..."
          className="border border-amber-600 rounded px-3 py-2 min-h-96 max-h-96 overflow-y-auto focus:outline-none bg-white"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaveDisabled}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        type="button"
      >
        Save Agent
      </button>
    </div>
  );
};
