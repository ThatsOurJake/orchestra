import { create } from 'zustand';

interface InputModalRequest {
  title: string;
  label?: string;
  defaultValue?: string;
}

interface InputModalStore {
  isOpen: boolean;
  title: string;
  label?: string;
  defaultValue?: string;
  resolver: ((value: string | null) => void) | null;

  openModal: (request: InputModalRequest) => Promise<string | null>;
  closeModal: (value: string | null) => void;
}

export const useInputModalStore = create<InputModalStore>((set, get) => ({
  isOpen: false,
  title: '',
  label: undefined,
  defaultValue: undefined,
  resolver: null,

  openModal: (request: InputModalRequest) => {
    return new Promise<string | null>((resolve) => {
      set({
        isOpen: true,
        title: request.title,
        label: request.label,
        defaultValue: request.defaultValue,
        resolver: resolve,
      });
    });
  },

  closeModal: (value: string | null) => {
    const { resolver } = get();
    if (resolver) {
      resolver(value);
    }
    set({
      isOpen: false,
      title: '',
      label: undefined,
      defaultValue: undefined,
      resolver: null,
    });
  },
}));
