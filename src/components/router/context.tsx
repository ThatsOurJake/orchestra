import { createContext, useContext } from 'react';

interface RouterContext {
  location: string;
  navigate: (path: string) => void;
}

export const RouterContext = createContext<Partial<RouterContext>>({});

export const useLocation = () => useContext(RouterContext).location!;

export const useNavigation = () => useContext(RouterContext).navigate!;
