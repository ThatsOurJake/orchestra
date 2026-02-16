import { create } from 'zustand';

interface FileImportModalStore {
  isOpen: boolean;
  title: string;
  resolver: ((value: unknown | null) => void) | null;

  openModal: <T = unknown>(title: string) => Promise<T | null>;
  closeModal: (value: unknown | null) => void;
}

export const useFileImportModalStore = create<FileImportModalStore>(
  (set, get) => ({
    isOpen: false,
    title: '',
    resolver: null,

    openModal: <T = unknown>(title: string): Promise<T | null> => {
      return new Promise<T | null>((resolve) => {
        set({
          isOpen: true,
          title,
          resolver: resolve as (value: unknown | null) => void,
        });
      });
    },

    closeModal: (value: unknown | null) => {
      const { resolver } = get();
      if (resolver) {
        resolver(value);
      }
      set({
        isOpen: false,
        title: '',
        resolver: null,
      });
    },
  }),
);
