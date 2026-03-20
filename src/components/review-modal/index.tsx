import { useCallback } from 'react';
import { Button } from '../shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shadcn/ui/dialog';
import { useReviewModalStore } from './review-modal-store';

export const ReviewModal = () => {
  const { isOpen, label, content, closeModal } = useReviewModalStore();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal(null);
      }
    },
    [closeModal],
  );

  const handleApprove = useCallback(() => {
    closeModal(true);
  }, [closeModal]);

  const handleReject = useCallback(() => {
    closeModal(false);
  }, [closeModal]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review Output</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2 min-h-0 flex-1">
          {label && <p className="text-sm font-medium">{label}</p>}
          <div className="overflow-y-auto rounded border border-gray-200 bg-gray-50 p-3 flex-1 min-h-0 max-h-[60vh]">
            <p className="whitespace-pre-wrap text-sm">{content}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReject}
            className="cursor-pointer text-red-600 border-red-300 hover:bg-red-50"
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            className="cursor-pointer bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
