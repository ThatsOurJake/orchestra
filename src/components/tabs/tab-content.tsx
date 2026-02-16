import { createElement, type ReactElement, useMemo } from 'react';
import { useCurrentTab } from './context';
import type { TabScreenProps } from './tab-screen';

export interface TabContentProps {
  children: ReactElement<TabScreenProps> | ReactElement<TabScreenProps>[];
}

export const TabContent = ({ children }: TabContentProps) => {
  const currentTab = useCurrentTab();
  const arrChildren = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children],
  );
  const remapped = arrChildren.map((c, index) =>
    createElement(c.type, {
      ...c.props,
      key: `screen-${index}`,
      isVisible: currentTab === index,
    }),
  );

  return (
    <div className="p-2 bg-gray-200 h-full overflow-y-auto overflow-x-hidden text-black">
      {remapped}
    </div>
  );
};
