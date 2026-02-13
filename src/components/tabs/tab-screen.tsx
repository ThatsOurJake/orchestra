import type { ReactElement } from 'react';
import React from 'react';

export interface TabScreenProps {
  component: (props?: any) => ReactElement;
  componentProps?: any;
  isVisible?: boolean;
}

export const TabScreen = ({
  component,
  componentProps,
  isVisible,
}: TabScreenProps) => {
  return (
    <div className={`${isVisible ? 'block' : 'hidden'} h-full w-full`}>
      {React.createElement(component, componentProps)}
    </div>
  );
};
