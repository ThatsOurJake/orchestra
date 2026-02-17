interface Output {
  content: string;
  timestamp: number;
}

interface OutputDisplayProps {
  outputs: Output[];
  emptyMessage?: string;
}

export const OutputDisplay = ({
  outputs,
  emptyMessage = 'No outputs yet...',
}: OutputDisplayProps) => {
  const reversed = outputs.slice().reverse();

  return (
    <div className="flex-1 space-y-3">
      {reversed.length === 0 && (
        <p className="text-gray-500 italic">{emptyMessage}</p>
      )}

      {reversed.map((output, index) => (
        <div
          key={`output-${output.timestamp}-${index}`}
          className="bg-gray-100 border border-gray-300 p-3 rounded"
        >
          <p className="whitespace-pre-wrap">{output.content}</p>
          <span className="text-xs text-gray-500 mt-2 block">
            {new Date(output.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};
