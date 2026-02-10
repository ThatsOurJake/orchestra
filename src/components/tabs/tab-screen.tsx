import type { ReactElement } from 'react';
import React from 'react';

export interface TabScreenProps {
  component: () => ReactElement;
  isVisible?: boolean;
}

export const TabScreen = ({ component, isVisible }: TabScreenProps) => {
  return (
    <div className={`${isVisible ? 'block' : 'hidden'} h-full w-full`}>
      {React.createElement(component)}
    </div>
  );
};
