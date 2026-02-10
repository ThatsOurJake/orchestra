import type { ReactElement } from 'react';
import { createElement, useMemo } from 'react';
import { useChangeTab, useCurrentTab } from './context';
import type { TabProps } from './tab';

export interface TabBarProps {
  children: ReactElement<TabProps> | ReactElement<TabProps>[];
}

export const TabBar = ({ children }: TabBarProps) => {
  const currentTab = useCurrentTab();
  const changeTab = useChangeTab();
  const arrChildren = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children],
  );

  const remapped = arrChildren.map((c, index) =>
    createElement(c.type, {
      ...c.props,
      index,
      key: `tab-${index}`,
      isSelected: currentTab === index,
      onClick: () => {
        changeTab(index);
      },
    }),
  );

  return (
    <div className="w-full px-2 pt-2">
      <div className="overflow-x-auto flex flex-row gap-x-2">{remapped}</div>
    </div>
  );
};
