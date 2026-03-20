import { useCallback } from 'react';
import type { AppNodes } from '../flow-store';

interface ToolkitNodeProps {
  label: string;
  nodeType: AppNodes['type'];
  onClick: (nodeType: AppNodes['type']) => void;
  colourClass: string;
}

export const ToolkitNode = ({
  nodeType,
  onClick,
  label,
  colourClass,
}: ToolkitNodeProps) => {
  const _onClick = useCallback(() => {
    onClick(nodeType);
  }, [nodeType, onClick]);

  return (
    <button
      className={`border border-black/20 rounded text-center text-sm p-2 w-full cursor-pointer hover:brightness-95 transition-all ${colourClass}`}
      onClick={_onClick}
      type="button"
    >
      {label}
    </button>
  );
};
