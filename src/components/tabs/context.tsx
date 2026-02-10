import React, { useContext } from 'react';

interface TabContext {
  currentTab: number;
  changeTab: (index: number) => void;
}

export const TabContext = React.createContext<Partial<TabContext>>({});

export const useChangeTab = () => useContext(TabContext).changeTab!;

export const useCurrentTab = () => useContext(TabContext).currentTab!;
