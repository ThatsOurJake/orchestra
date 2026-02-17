import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { langRunner, syntaxCheck } from '../../lang/runner';
import { replaceContextInStr } from '../../machine/utils';

interface ContextEntry {
  id: string;
  key: string;
  value: string;
  isJson: boolean;
}

export const LangPlayground = () => {
  const [contextEntries, setContextEntries] = useState<ContextEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [runAsStatement, setRunAsStatement] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [isError, setIsError] = useState(false);

  const addContextEntry = useCallback(() => {
    setContextEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', value: '', isJson: false },
    ]);
  }, []);

  const removeContextEntry = useCallback((id: string) => {
    setContextEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const updateContextEntry = useCallback(
    (
      id: string,
      field: 'key' | 'value' | 'isJson',
      newValue: string | boolean,
    ) => {
      setContextEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: newValue } : entry,
        ),
      );
    },
    [],
  );

  const handleRun = useCallback(() => {
    setOutput('');
    setIsError(false);

    try {
      const context = new Map<string, unknown>();
      for (const entry of contextEntries) {
        if (entry.key.trim()) {
          let value: unknown = entry.value;
          if (entry.isJson && entry.value.trim()) {
            try {
              value = JSON.parse(entry.value);
            } catch (e) {
              setIsError(true);
              setOutput(
                `JSON Parse Error in "${entry.key}": ${e instanceof Error ? e.message : String(e)}`,
              );
              return;
            }
          }
          context.set(entry.key.trim(), value);
        }
      }

      if (runAsStatement) {
        const errors = syntaxCheck(inputText);
        if (errors.length > 0) {
          setIsError(true);
          setOutput(
            `Syntax Error:\n${errors.map((e) => e.message).join('\n')}`,
          );
          return;
        }

        const result = langRunner(inputText, context);
        setOutput(String(result ?? 'null'));
      } else {
        const result = replaceContextInStr(inputText, context);
        setOutput(result);
      }
    } catch (error) {
      setIsError(true);
      setOutput(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [contextEntries, inputText, runAsStatement]);

  return (
    <div className="flex flex-col gap-y-4 p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Lang Playground</h2>
      <Link to="/docs/lang">
        <p className="text-blue-500 hover:underline">Read about lang here</p>
      </Link>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="input-text" className="font-semibold">
          Input
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            runAsStatement
              ? 'Enter statement... e.g., REPL["Hello", "H", "J"]'
              : 'Enter text with expressions... e.g., #REPL["Hello", "H", "J"]# or %myVar%'
          }
          className="border border-amber-600 rounded px-3 py-2 min-h-32 max-h-32 overflow-y-auto focus:outline-none bg-white font-mono text-sm"
        />

        <div className="flex items-start gap-x-2">
          <input
            id="run-as-statement"
            type="checkbox"
            checked={runAsStatement}
            onChange={(e) => setRunAsStatement(e.target.checked)}
            className="mt-1 cursor-pointer"
          />
          <div className="flex flex-col gap-y-1">
            <label
              htmlFor="run-as-statement"
              className="font-semibold cursor-pointer"
            >
              Run as statement
            </label>
            <p className="text-sm text-gray-600">
              {runAsStatement ? (
                <>
                  <strong>Statement mode:</strong> Input is parsed as a single
                  lang expression. No delimiters needed. Example:{' '}
                  <code className="bg-gray-100 px-1 rounded">
                    TRIM["Space. "]
                  </code>
                </>
              ) : (
                <>
                  <strong>Text mode:</strong> Expressions wrapped in{' '}
                  <code className="bg-gray-100 px-1 rounded">#...#</code> are
                  evaluated inline within surrounding text. Context variables in{' '}
                  <code className="bg-gray-100 px-1 rounded">%...%</code> are
                  replaced. Example:{' '}
                  <code className="bg-gray-100 px-1 rounded">
                    Hello #TRIM["Space. "]#
                  </code>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between items-center">
          <div className="font-semibold">Context Variables</div>
          <button
            onClick={addContextEntry}
            className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors cursor-pointer"
            type="button"
          >
            Add Variable
          </button>
        </div>

        {contextEntries.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No context variables. Click "Add Variable" to create one.
          </p>
        ) : (
          <div className="flex flex-col gap-y-3">
            {contextEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex gap-x-2 items-start mb-2">
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(e) =>
                      updateContextEntry(entry.id, 'key', e.target.value)
                    }
                    placeholder="Key"
                    className="border border-amber-600 rounded px-3 py-2 focus:outline-none bg-white w-48 font-mono text-sm"
                  />
                  <textarea
                    value={entry.value}
                    onChange={(e) =>
                      updateContextEntry(entry.id, 'value', e.target.value)
                    }
                    placeholder={
                      entry.isJson ? '["array"] or {"key": "value"}' : 'Value'
                    }
                    className="border border-amber-600 rounded px-3 py-2 min-h-10 max-h-32 overflow-y-auto focus:outline-none bg-white flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => removeContextEntry(entry.id)}
                    className="px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors cursor-pointer"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-x-2 pl-1">
                  <input
                    id={`json-${entry.id}`}
                    type="checkbox"
                    checked={entry.isJson}
                    onChange={(e) =>
                      updateContextEntry(entry.id, 'isJson', e.target.checked)
                    }
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor={`json-${entry.id}`}
                    className="text-xs text-gray-600 cursor-pointer"
                  >
                    Interpret as JSON
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Output</div>
        <div
          className={`border rounded px-3 py-2 min-h-32 max-h-96 overflow-y-auto bg-gray-50 font-mono text-sm whitespace-pre-wrap ${
            isError ? 'border-red-500 text-red-700' : 'border-gray-300'
          }`}
        >
          {output || (
            <span className="text-gray-400 italic">
              Output will appear here after running...
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={!inputText.trim()}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        type="button"
      >
        Run
      </button>
    </div>
  );
};
