import { useCallback, useState } from 'react';
import { Button } from '../shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shadcn/ui/dialog';
import { Textarea } from '../shadcn/ui/textarea';
import { useInputModalStore } from './input-modal-store';

export const InputModal = () => {
  const { isOpen, title, label, defaultValue, closeModal } =
    useInputModalStore();
  const [value, setValue] = useState('');

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal(null);
        setValue('');
      }
    },
    [closeModal],
  );

  const handleConfirm = useCallback(() => {
    closeModal(value);
    setValue('');
  }, [closeModal, value]);

  const handleCancel = useCallback(() => {
    closeModal(null);
    setValue('');
  }, [closeModal]);

  // Reset value when modal opens with a new defaultValue
  const handleOpenChangeWithReset = useCallback(
    (open: boolean) => {
      if (open && defaultValue !== undefined) {
        setValue(defaultValue);
      }
      handleOpenChange(open);
    },
    [defaultValue, handleOpenChange],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChangeWithReset}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {label && (
            <label htmlFor="input-field" className="text-sm font-medium">
              {label}
            </label>
          )}
          <Textarea
            id="input-field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value..."
            className="min-h-25 max-h-96 overflow-y-auto"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="cursor-pointer">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
