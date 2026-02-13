import type { ReactNode } from 'react';

interface CWScreenWrapperProps {
  selectedTab: string;
  isVisible: boolean;
  children: ReactNode;
}

export const CWScreenWrapper = ({
  children,
  selectedTab,
  isVisible,
}: CWScreenWrapperProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div data-current-screen={selectedTab} className="h-full">
      {children}
    </div>
  );
};
