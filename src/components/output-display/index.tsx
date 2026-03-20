interface Output {
  content: string;
  timestamp: number;
  level?: 'info' | 'warning' | 'error';
}

interface OutputDisplayProps {
  outputs: Output[];
  emptyMessage?: string;
}

const levelStyles: Record<'info' | 'warning' | 'error', string> = {
  info: 'bg-blue-50 border-blue-300 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-300 text-yellow-900',
  error: 'bg-red-50 border-red-300 text-red-900',
};

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

      {reversed.map((output, index) => {
        const colorClasses = output.level
          ? levelStyles[output.level]
          : 'bg-white border-gray-300';

        return (
          <div
            key={`output-${output.timestamp}-${index}`}
            className={`${colorClasses} border p-3 rounded`}
          >
            <p className="whitespace-pre-wrap">{output.content}</p>
            <span className="text-xs opacity-60 mt-2 block">
              {new Date(output.timestamp).toLocaleTimeString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};
