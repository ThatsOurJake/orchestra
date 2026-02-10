import type { ReactElement } from 'react';
import { createElement } from 'react';
import { useLocation } from './context';

interface RouteProps {
  path: string;
  component: () => ReactElement;
}

export const Route = ({ component, path }: RouteProps) => {
  const location = useLocation();

  if (location === path) {
    return createElement(component);
  }

  return null;
};
