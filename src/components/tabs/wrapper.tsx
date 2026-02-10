import { type ReactElement, useState } from 'react';
import { TabContext } from './context';
import type { TabBarProps } from './tab-bar';

interface TabsWrapperProps {
  children: ReactElement<TabBarProps> | ReactElement<TabBarProps>[];
}

export const TabsWrapper = ({ children }: TabsWrapperProps) => {
  const [currentTab, setCurrentTab] = useState<number>(0);

  return (
    <TabContext.Provider
      value={{
        currentTab,
        changeTab(index) {
          setCurrentTab(index);
        },
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
