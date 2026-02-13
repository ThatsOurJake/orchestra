import { type Node, type NodeProps, Position } from '@xyflow/react';
import { type ChangeEvent, useCallback, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  determineContextKeysFromNode,
  isCreateAgentNode,
  walkBackFindingNodeType,
} from '../../../utils/flow-helpers';
import { BaseHandle } from '../../shadcn/base-handle';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '../../shadcn/base-node';
import type { Agent } from '../../store';
import { ConnectionHandle } from '../connection-handle';
import { type AppState, useFlowStore } from '../flow-store';
import { useTextInsert } from '../hooks/use-text-insert';

export type SendMessageToAgentProps = Node<
  {
    messageContent?: string;
    selectedAgent?: {
      agent: Agent;
      agentFlowId: string;
    };
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
  data: { messageContent = '', selectedAgent },
  id,
}: NodeProps<SendMessageToAgentProps>) => {
  const { nodes, edges, setInteractive, updateSendAgentMessageNode } =
    useFlowStore(useShallow(selector));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const foundAgents = useMemo(
    () => walkBackFindingNodeType(['createAgent'], id, nodes, edges),
    [nodes, edges, id],
  );
  const mappedAgents = useMemo(
    () =>
      foundAgents.found
        .reverse()
        .reduce((acc: { agentFlowId: string; agent: Agent }[], current) => {
          if (!isCreateAgentNode(current)) {
            return acc;
          }

          const {
            data: { selectedAgent },
          } = current;

          if (selectedAgent) {
            const existCounts = acc.filter((x) => {
              return x.agent.name.startsWith(selectedAgent.agent.name);
            }).length;

            if (existCounts > 0) {
              acc.push({
                agentFlowId: selectedAgent.agentFlowId,
                agent: {
                  ...selectedAgent.agent,
                  name: `${selectedAgent.agent.name} [-${existCounts + 1}]`,
                },
              });
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
        selectedAgent: mappedAgents.find((x) => x.agentFlowId === value)!,
        messageContent,
      });
    },
    [id, messageContent, updateSendAgentMessageNode, mappedAgents],
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!selectedAgent) {
        return;
      }

      updateSendAgentMessageNode(id, {
        selectedAgent,
        messageContent: newValue,
      });
    },
    [id, selectedAgent, updateSendAgentMessageNode],
  );

  const { onCursorPositionChange, insertTextAtCursor } = useTextInsert(
    textareaRef,
    messageContent,
    handleValueChange,
  );

  const onMessageChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const {
        target: { value, selectionStart, selectionEnd, scrollTop },
      } = e;

      if (!selectedAgent) {
        return;
      }

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

  const insertContextValue = useCallback(
    (contextKey: string) => {
      insertTextAtCursor(`%${contextKey}%`);
    },
    [insertTextAtCursor],
  );

  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle className="text-center">
          Send message to agent
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <BaseHandle
          id="send-msg-target"
          type="target"
          position={Position.Top}
        />
        <select
          className="border border-amber-200 p-0.5 rounded"
          value={selectedAgent?.agentFlowId || 'default'}
          onChange={onSelectChange}
        >
          <option disabled value="default">
            Select an agent
          </option>
          {mappedAgents.map((a) => (
            <option key={a.agentFlowId} value={a.agentFlowId}>
              {a.agent.name}
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
