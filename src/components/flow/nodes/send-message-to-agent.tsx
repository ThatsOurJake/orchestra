import { type Node, type NodeProps, Position } from '@xyflow/react';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  determineContextKeysFromNode,
  isCreateAgentNode,
  walkBackFindingNodeType,
} from '../../../utils/flow-helpers';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '../../shadcn/base-node';
import { ConnectionHandle } from '../connection-handle';
import { type AppState, useFlowStore } from '../flow-store';

export type SendMessageToAgentProps = Node<
  {
    messageContent?: string;
    selectedAgent?: string;
  },
  'sendMessageToAgent'
>;

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setInteractive: state.setInteractive,
  updateSendAgentMessageNode: state.updateSendAgentMessageNode,
});

export const SendMessageToAgentNode = ({
  data: { messageContent = '', selectedAgent = 'default' },
  id,
}: NodeProps<SendMessageToAgentProps>) => {
  const { nodes, edges, setInteractive, updateSendAgentMessageNode } =
    useFlowStore(useShallow(selector));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const foundAgents = useMemo(
    () => walkBackFindingNodeType(['createAgent'], id, nodes, edges),
    [nodes, edges, id],
  );
  const agentNames: string[] = useMemo(
    () =>
      foundAgents.found.reverse().reduce((acc: string[], current) => {
        if (!isCreateAgentNode(current)) {
          return acc;
        }

        const {
          data: { selectedAgent },
        } = current;

        if (selectedAgent) {
          const existCounts = acc.filter((x) =>
            x.startsWith(selectedAgent),
          ).length;
          if (existCounts > 0) {
            acc.push(`${selectedAgent} [-${existCounts + 1}]`);
          } else {
            acc.push(selectedAgent);
          }
        }

        return acc;
      }, []),
    [foundAgents.found],
  );
  const contextProps = useMemo(
    () => determineContextKeysFromNode(id, nodes, edges),
    [edges, id, nodes],
  );

  const onFocus = useCallback(() => {
    setInteractive(false);
  }, [setInteractive]);

  const onBlur = useCallback(() => {
    setInteractive(true);
  }, [setInteractive]);

  const onSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const {
        target: { value },
      } = e;
      updateSendAgentMessageNode(id, {
        selectedAgent: value,
        messageContent,
      });
    },
    [id, messageContent, updateSendAgentMessageNode],
  );

  const onMessageChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const {
        target: { value, selectionStart, selectionEnd, scrollTop },
      } = e;

      setCursorPosition(selectionStart);

      updateSendAgentMessageNode(id, {
        selectedAgent,
        messageContent: value,
      });

      // Restore cursor position and scroll position after React re-renders
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
          textareaRef.current.scrollTop = scrollTop;
        }
      });
    },
    [id, selectedAgent, updateSendAgentMessageNode],
  );

  const onCursorPositionChange = useCallback(
    (
      e: MouseEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLTextAreaElement>,
    ) => {
      setCursorPosition(e.currentTarget.selectionStart);
    },
    [],
  );

  const insertContextValue = useCallback(
    (contextKey: string) => {
      if (!textareaRef.current) return;

      const textToInsert = `%${contextKey}%`;
      const currentValue = messageContent;
      const newValue =
        currentValue.slice(0, cursorPosition) +
        textToInsert +
        currentValue.slice(cursorPosition);
      const newCursorPos = cursorPosition + textToInsert.length;

      updateSendAgentMessageNode(id, {
        selectedAgent,
        messageContent: newValue,
      });

      // Set cursor position after the inserted text
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      });
    },
    [
      id,
      selectedAgent,
      messageContent,
      cursorPosition,
      updateSendAgentMessageNode,
    ],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Send message to agent
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <ConnectionHandle
          id="send-msg-target"
          type="target"
          position={Position.Top}
          connectionLimit={1}
        />
        <select
          className="border border-amber-200 p-0.5 rounded"
          value={selectedAgent}
          onChange={onSelectChange}
        >
          <option disabled value="default">
            Select an agent
          </option>
          {agentNames.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <textarea
          ref={textareaRef}
          className="border border-amber-600 w-full h-40 resize-none bg-white p-1 rounded nowheel"
          onChange={onMessageChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onClick={onCursorPositionChange}
          onKeyUp={onCursorPositionChange}
          value={messageContent}
        />
        <div>
          <p className="text-sm">
            Context Values - click to insert at cursor position
          </p>
          <div className="flex flex-wrap gap-2">
            {contextProps.map((x, index) => (
              <p
                className="text-xs text-gray-400 italic cursor-pointer hover:text-amber-600 hover:bg-amber-50 px-1 rounded transition-colors"
                key={`cp-${index}`}
                onClick={() => insertContextValue(x[0])}
                title={`Click to insert %${x[0]}%`}
              >
                {x[0]} - {x[1]}
              </p>
            ))}
          </div>
        </div>
        <ConnectionHandle
          id="send-msg-source"
          type="source"
          position={Position.Bottom}
          connectionLimit={1}
        />
      </BaseNodeContent>
      <BaseNodeFooter>
        <p className="text-xs text-gray-400">
          This node will produce "{id}_output"
        </p>
      </BaseNodeFooter>
    </BaseNode>
  );
};
