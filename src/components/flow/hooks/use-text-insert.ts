import {
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useCallback,
  useState,
} from 'react';

/**
 * Custom hook for managing text insertion at cursor position in input/textarea elements.
 * Tracks cursor position and provides utilities for inserting text at the current cursor location.
 *
 * @template T - HTMLInputElement or HTMLTextAreaElement
 * @param ref - React ref to the input/textarea element
 * @param currentValue - Current value of the input/textarea
 * @param onValueChange - Callback to update the value when text is inserted
 * @returns Object containing cursor position change handler and text insertion function
 */
export const useTextInsert = <T extends HTMLInputElement | HTMLTextAreaElement>(
  ref: RefObject<T | null>,
  currentValue: string,
  onValueChange: (newValue: string) => void,
) => {
  const [cursorPosition, setCursorPosition] = useState(0);

  const onCursorPositionChange = useCallback(
    (e: MouseEvent<T> | KeyboardEvent<T>) => {
      setCursorPosition(e.currentTarget.selectionStart || 0);
    },
    [],
  );

  const insertTextAtCursor = useCallback(
    (text: string) => {
      if (!ref.current) return;

      const newValue =
        currentValue.slice(0, cursorPosition) +
        text +
        currentValue.slice(cursorPosition);
      const newCursorPos = cursorPosition + text.length;

      onValueChange(newValue);

      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      });
    },
    [currentValue, cursorPosition, onValueChange, ref],
  );

  return {
    onCursorPositionChange,
    insertTextAtCursor,
  };
};
