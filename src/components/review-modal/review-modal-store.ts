import { create } from 'zustand';

interface ReviewModalRequest {
  label?: string;
  content: string;
}

interface ReviewModalStore {
  isOpen: boolean;
  label?: string;
  content: string;
  resolver: ((approved: boolean | null) => void) | null;

  openModal: (request: ReviewModalRequest) => Promise<boolean | null>;
  closeModal: (approved: boolean | null) => void;
}

export const useReviewModalStore = create<ReviewModalStore>((set, get) => ({
  isOpen: false,
  label: undefined,
  content: '',
  resolver: null,

  openModal: (request: ReviewModalRequest) => {
    return new Promise<boolean | null>((resolve) => {
      set({
        isOpen: true,
        label: request.label,
        content: request.content,
        resolver: resolve,
      });
    });
  },

  closeModal: (approved: boolean | null) => {
    const { resolver } = get();
    if (resolver) {
      resolver(approved);
    }
    set({
      isOpen: false,
      label: undefined,
      content: '',
      resolver: null,
    });
  },
}));
